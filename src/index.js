const express = require('express');
const webPush = require('web-push');
const app = express();
const bodyParser = require('body-parser');
const config = require('config');
const Promise = require('bluebird');

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

app.post('/api/web-push-register', function (req, res) {
    subscription = req.body.subscription;
    console.log(subscription);
    res.sendStatus(201);
});

app.post('/api/notifications/send', async function (req, res) {
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

        try {
            await webPush.sendNotification(subscription, payload, options);
            response.success = true;
        } catch (error) {
            response.error = error.message;
        }

        responses.push(response);
    });

    res.header('Content-Type', 'application/json');
    res.send({
        data: responses,
    });
});

app.get('/api/notifications', function (req, res) {
    const payload = 'Hi';
    const options = {
        TTL: WEB_PUSH_TTL,
    };
    webPush.sendNotification(subscription, payload, options)
        .then(function (response) {
            res.sendStatus(201);
        })
        .catch(function (error) {
            res.sendStatus(500);
        });
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
