const mysql = require('mysql2/promise')

let config = {}
if (
    process.env.NODE_ENV === undefined ||
    process.env.NODE_ENV === 'development'
) {
    config = require('../config/default.json')
} else if (process.env.NODE_ENV === 'production') {
    config = require('../config/production.js')
}

const pool = mysql.createPool({
    host: 'eu-cdbr-west-03.cleardb.net',
    user: 'b6a3e0f6039bf6',
    password: config['dbPass'],
    database: 'heroku_9c7d675814712d7',
    connectionLimit: 10,
})

const getConnection = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const connection = await pool.getConnection()
            resolve(connection)
        } catch (e) {
            console.log(`Couldn't get connection to MySQL server!\\n\\n${e}`)
            reject({ error: "Couldn't get connection to MySQL server!" })
        }
    })
}

module.exports = getConnection
