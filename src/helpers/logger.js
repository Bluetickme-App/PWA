const { createLogger, format, transports } = require('winston');

module.exports = createLogger({
    level: 'debug',
    transports: [
        new transports.Console(),
        new transports.File({
            filename: 'logs/server.log',
            maxsize: 5242880, // 5MB
            maxFiles: 1,
            format: format.combine(
                format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
                format.align(),
                format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            ),
        }),
    ],
    exitOnError: false
});
