const dotenv = require('dotenv').config()
const logger = require('../services/logger')

// Refer to the readme for instructions on how to generate the token.
const SECRET_TOKEN = process.env.TOKEN

// Authentication middleware.
const authenticate = (req, res) => {
    // Get the Authorization header value.
    const authorizationHeader = req.headers.authorization

    // Check if the Authorization header is present.
    if (!authorizationHeader) {
        return res.status(401).send('🛡️ Authorization header is missing.')
    }

    // Extract the token from the Authorization header
    const token = authorizationHeader.split(' ')[1]

    // Check the validity of a token. In our case we assert
    // that the token is valid if it matches the expected token.
    if (token !== SECRET_TOKEN) {
        var msg = '❌ Invalid token.'
        logger.error(msg)
        return res.status(401).send(msg)
    } else {
        var msg = '✅ Token is valid.'
        logger.info(msg)
        return res.status(200).send(msg)
    }
}

module.exports = authenticate
