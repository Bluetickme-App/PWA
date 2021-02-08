# PWA
- Main site: https://www.bluetickme.com
- Push notification site: https://push.bluetickme.com

## Environment variables
- `PORT` - What port to use for node server.
- `VAPID_SUBJECT` - App domain url.
- `VAPID_PUBLIC_KEY` - Vapid public key.
- `VAPID_PRIVATE_KEY` - Vapid private key.
- `GCM_API_KEY` - Google gcm api key.
- `MANIFEST_START_URL` - Manifest start url. Domain url of the main application.

## Production deployment
1. Setup pm2
2. `git pull` from master branch
3. Set environment variables
4. cd <app directory>
5. npm run build
6. Run `pm2 start dist/index.js`
7. Add nginx routing to node server.
8. Test.

## How to call push send api
1. API `POST /api/notifications/send`
2. Required Header `X-Bluetickme`. This should be configured on push server as well.
3. Request Body

```json
{
    "notifications": [
        {
            "subscription": {
                "id": "",
                "subscription": {
                    "endpoint": "",
                    "expirationTime": "",
                    "keys": {
                        "p256dh": "",
                        "auth": ""
                    }
                }
            },
            "payload": {
                "title": "",
                "options": {
                    "body": "",
                    "icon": "http://localhost:3000/images/icons/icon-144x144.png",
                    "image": "http://localhost:3000/images/icons/icon-72x72.png",
                    "badge": "http://localhost:3000/images/icons/icon-72x72.png",
                    "lang": "",
                    "data": {},
                    "tag": "", // A unique id
                    "silent": false,
                    "vibrate": [200, 100, 200, 100, 200, 100, 200],
                    "renotify": true
                }
            }
        }
    ]
}
```

* See [here](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification) to know more about `notification.payload` fields.

4. Limit - As of right now there is no limit on sending web push.
