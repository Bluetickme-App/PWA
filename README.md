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
