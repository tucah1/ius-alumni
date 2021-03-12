const jwt = require('jsonwebtoken')
let config = {}
if (
    process.env.NODE_ENV === undefined ||
    process.env.NODE_ENV === 'development'
) {
    config = require('../config/default.json')
} else if (process.env.NODE_ENV === 'production') {
    config = require('../config/production.js')
}
module.exports = function (req, res, next) {
    const token = req.header('x-auth-token')

    if (!token) {
        return res
            .status(401)
            .json({
                errors: [
                    { code: 401, message: 'No token, authorization failed!' },
                ],
            })
    }

    try {
        const decoded = jwt.verify(token, config['jwtSecret'])

        req.user = decoded.user
        next()
    } catch (e) {
        return res.status(401).json({
            errors: [
                {
                    code: 401,
                    message: 'Token is invalid, authorization failed!',
                },
            ],
        })
    }
}
