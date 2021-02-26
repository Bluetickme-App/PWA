const path = require('path');
const fs = require('fs');
const express = require('express');
const webPush = require('web-push');
const app = express();
const bodyParser = require('body-parser');
const config = require('config');
const Promise = require('bluebird');
const cors = require('cors');
const morgan = require('morgan');

const {HttpAgent, logger} = require('./helpers');
const {SubscriptionService, CryptoService} = require('./services');
const {checkHeader} = require('./middlewares');

const port = config.get('app.port');

// const vapidKeys = webPush.generateVAPIDKeys();
// console.log(vapidKeys);

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
const cryptoService = new CryptoService(ctx);

// // Create a write stream (in append mode)
// @TODO It does not work on google cloud as it can't create folders in read only env
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs/requests.log'), {flags: 'a'});
// // Setup the logger
// app.use(morgan('combined', {stream: accessLogStream}));

app.use(cors({
    origin: '*',
}));

app.use(bodyParser.json());

app.get('/api/vapid-public-key', function (req, res) {
    res.header('Content-Type', 'application/json');
    res.send({
        vapid_public_key: vapid_public_key
    });
});

app.post('/crypto/verify-signature', checkHeader, async function (req, res, next) {
    try {
        const counter = req.body.counter;
        const attestationObject = req.body.attestation_object;
        const clientDataJSON = req.body.client_data_json;
        const authenticatorData = req.body.authenticator_data;
        const signature = req.body.signature;
        const response = cryptoService.verifyAssertion({
            counter,
            attestationObject,
            clientDataJSON,
            authenticatorData,
            signature,
        });
        res.header('Content-Type', 'application/json');
        res.send(response);
    } catch (err) {
        logger.error(err);
        res.header('Content-Type', 'application/json');
        res.send({
            verified: false,
            counter: 0,
        });
    }
});

app.post('/api/web-push-register', async function (req, res, next) {
    const user_id = req.body.user_id;
    const subscription = req.body.subscription;
    logger.info("web-push-register api request body");
    logger.info(JSON.stringify(subscription));

    try {
        const response = await subscriptionService.storeSubscription({
            user_id: user_id || null,
            subscription,
            status: 'active',
        });
        res.header('Content-Type', 'application/json');
        res.send({
            data: response.data,
        });

        logger.info("web-push-register api response");
        logger.info(JSON.stringify(response));
    } catch(error) {
        logger.error("web-push-register api error");
        logger.error(JSON.stringify(error));
        next(error);
    }
});

app.post('/api/notifications/send', checkHeader, async function (req, res) {
    const responses = [];

    const options = {
        TTL: WEB_PUSH_TTL,
    };
    const notifications = req.body.notifications;
    logger.info("notifications-send api request body");
    logger.info(JSON.stringify(req.body));

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
            logger.error(`notifications-send api request processing error for subscription - ${response.subscription_id}`);
            logger.error(JSON.stringify(error));
            response.error = error.message;
        }

        responses.push(response);
    });

    res.header('Content-Type', 'application/json');
    res.send({
        data: responses,
    });

    logger.info("notifications-send api request response");
    logger.info(JSON.stringify(responses));
});

app.use(express.static('public'));

app.use(function (err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    res.header('Content-Type', 'application/json');
    res.status(err.code || 500);
    res.send({
        error: err.message,
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
