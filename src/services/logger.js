const { createLogger, format, transports } = require('winston')

const logger = createLogger({
    level: 'info', // Log messages with a severity of 'info' and above
    format: format.combine(
        format.timestamp({
            format: 'DD-MM HH:mm:ss',
        }),
        format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
    ),
    transports: [
        // Output logs to a file named 'server.log'.
        new transports.File({ filename: 'server.log', level: 'info' }),

        // Also output logs to the console...
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
    ],
})

module.exports = logger
