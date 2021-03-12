const mysql = require('mysql2/promise')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'iusalumni',
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
