const config = require('config');
const wix_token  = config.get('wix.token');

module.exports = function (req, res, next) {
    if (req.get('X-Bluetickme') !== wix_token) {
        throw new Error('Missing/Invalid required header');
    }

    next();
}
