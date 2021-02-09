const express = require('express');
const webPush = require('web-push');
const app = express();
const bodyParser = require('body-parser');
const config = require('config');
const Promise = require('bluebird');
const cors = require('cors');

const {HttpAgent} = require('./helpers');
const {SubscriptionService} = require('./services');
const {checkHeader} = require('./middlewares');

const port = config.get('app.port');
const manifestJSON = require('./public/manifest.json');

// const vapidKeys = webPush.generateVAPIDKeys();
// console.log(vapidKeys);

let subscription = null;
const WEB_PUSH_TTL = 60;

const vapid_subject = config.get('vapid.subject');
const vapid_public_key = config.get('vapid.public_key');
const vapid_private_key = config.get('vapid.private_key');

webPush.setGCMAPIKey(config.get('gcm.api_key'));
webPush.setVapidDetails(
    vapid_subject,
    vapid_public_key,
    vapid_private_key,
);

const ctx = {
    httpAgents: {
        blueTickMeAgent: new HttpAgent('https://www.bluetickme.com/_functions', {
            'Content-Type': 'application/json',
            'X-Bluetickme': config.get('wix.token'),
        }),
    },
};

const subscriptionService = new SubscriptionService(ctx);

app.use(cors());
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://www.bluetickme.com');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.json());

app.get('/manifest.json', function (req, res) {
    const url = config.get('manifest_start_url');
    const manifestObject = Object.assign({}, manifestJSON, {
        scope: url,
        start_url: url,
    })
    res.header('Content-Type', 'application/json');
    res.send(manifestObject);
});

app.get('/api/vapid-public-key', function (req, res) {
    res.header('Content-Type', 'application/json');
    res.send({
        vapid_public_key: vapid_public_key
    });
});

app.post('/api/web-push-register', async function (req, res) {
    const subscription = req.body.subscription;
    console.log(subscription);

    try {
        await subscriptionService.storeSubscription({
            user_id: null,
            subscription,
            status: 'active',
        });
    } catch(error) {
        console.log(error);
    }

    res.sendStatus(201);
});

app.post('/api/notifications/send', checkHeader, async function (req, res) {
    const responses = [];

    const options = {
        TTL: WEB_PUSH_TTL,
    };
    const notifications = req.body.notifications;

    await Promise.each(notifications, async (notification) => {
        const response = {
            subscription_id: null,
            success: false,
            error: null,
        };

        const {
            subscription,
            payload,
        } = notification;

        response.subscription_id = subscription.id;
        const pushSubscription = subscription.subscription;

        try {
            await webPush.sendNotification(pushSubscription, JSON.stringify(payload), options);
            response.success = true;
        } catch (error) {
            console.log(error);
            response.error = error.message;
        }

        responses.push(response);
    });

    res.header('Content-Type', 'application/json');
    res.send({
        data: responses,
    });
});

app.use(express.static('public'));

app.use(function (err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    res.header('Content-Type', 'application/json');
    res.status(500);
    res.send({
        error: err.message,
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
