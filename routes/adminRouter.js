const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const authMiddleware = require('../middleware/authMiddleware')
const getConnection = require('../config/database')
const { validateNewStudentData } = require('../util/validation')
const { getOffsetIncrement } = require('../util/helpers')

let config = {}
if (
    process.env.NODE_ENV === undefined ||
    process.env.NODE_ENV === 'development'
) {
    config = require('../config/default.json')
} else if (process.env.NODE_ENV === 'production') {
    config = require('../config/production.js')
}

// @route           GET /admin/load
// @desc            Load admin
// @access          Private
router.get('/load', authMiddleware, async (req, res) => {
    return res.json({ isAuthenticated: true })
})

// Testing purposes
/*router.post('/test', async (req, res) => {
    const pass = req.body.pass
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(pass, salt)
    return res.json({ hash })
})*/

// @route           POST /admin/register
// @desc            Create new admin account
// @access          Private
router.post('/register', authMiddleware, async (req, res) => {
    const { email, password } = req.body
    if (email === undefined || password === undefined) {
        return res.status(400).json({
            message:
                'Bad request! Please include required fields for this route!',
        })
    }

    try {
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT username FROM account WHERE username = ?',
            [email]
        )
        if (result[0].length > 0) {
            return res
                .status(400)
                .json({ message: 'User with this username already exists!' })
        }

        let salt = await bcrypt.genSalt(10)
        let hash = await bcrypt.hash(password, salt)
        let account_id = uuid.v4()

        await connection.query('INSERT INTO account SET ?', [
            { account_id, username: email, password: hash },
        ])
        connection.release()

        let jwtPayload = {
            user: {
                id: account_id,
            },
        }

        jwt.sign(
            jwtPayload,
            config['jwtSecret'],
            { expiresIn: '3h' },
            (err, token) => {
                if (err) throw err
                return res.json({ token })
            }
        )
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           POST /admin/login
// @desc            Login as admin
// @access          Public
router.post('/login', async (req, res) => {
    const user = { username: req.body.email, password: req.body.password }

    try {
        // Continue here !!!
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT account_id, username, password FROM account WHERE username = ?',
            [user.username]
        )

        connection.release()
        if (result[0].length == 0) {
            return res.status(400).json({
                errors: [{ code: 400, message: 'Authorization failed!' }],
            })
        }

        data = result[0][0]
        const isMatch = await bcrypt.compare(user.password, data.password)
        if (!isMatch) {
            console.log(user.password, '-', data.password)
            return res.status(400).json({
                errors: [{ code: 400, message: 'Authorization failed!' }],
            })
        }

        let jwtPayload = {
            user: {
                id: data.account_id,
            },
        }

        jwt.sign(
            jwtPayload,
            config['jwtSecret'],
            { expiresIn: '3h' },
            (err, token) => {
                if (err) throw err
                return res.status(200).json({ token })
            }
        )
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           GET /admin/delete-account
// @desc            Delete admin account
// @access          Private
router.get('/delete-account', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection()
        await connection.query('DELETE FROM account WHERE account_id = ?', [
            req.user.id,
        ])
        connection.release()
        return res.json({ message: 'Account successfully deleted!' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           GET /admin/accounts
// @desc            Get all admin accounts
// @access          Private
router.get('/accounts', authMiddleware, async (req, res) => {
    try {
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT account_id, username FROM account'
        )
        connection.release()
        return res.json(result[0])
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           POST /admin/update-password
// @desc            Change user password
// @access          Private
router.post('/update-password', authMiddleware, async (req, res) => {
    const newPass = req.body.newPassword

    try {
        const connection = await getConnection()
        let salt = await bcrypt.genSalt(10)
        let hash = await bcrypt.hash(newPass, salt)

        await connection.query('UPDATE account SET ? WHERE account_id = ?', [
            { password: hash },
            req.user.id,
        ])

        connection.release()

        return res.json({ message: 'Password successfully updated!' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           POST /admin/add-student
// @desc            Add new student to database
// @access          Private
router.post('/add-student', authMiddleware, async (req, res) => {
    const { valid, errors } = validateNewStudentData(req.body)
    if (!valid) return res.status(400).json(errors)

    let { name, surname, graduated, description, location } = req.body

    try {
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT * FROM location WHERE title = ?',
            [location.title]
        )

        let dbLocationData = {}
        let locationStudentCount = 0

        if (result[0].length == 0) {
            const newLocation = {
                location_id: uuid.v4(),
                coordinate_x: location.coordinates[0],
                coordinate_y: location.coordinates[1],
                title: location.title,
                type: location.type,
                student_count: 1,
            }
            await connection.query('INSERT INTO location SET ?', [newLocation])
            dbLocationData = newLocation
            locationStudentCount = 1
        } else {
            await connection.query(
                'UPDATE location SET ? WHERE location_id = ?',
                [
                    { student_count: result[0][0].student_count + 1 },
                    result[0][0].location_id,
                ]
            )
            dbLocationData = result[0][0]
            locationStudentCount = result[0][0].student_count + 1
        }

        let newStudent = {
            student_id: uuid.v4(),
            name,
            surname,
            graduated,
            description,
            location_id: dbLocationData.location_id,
        }

        await connection.query('INSERT INTO student SET ?', [newStudent])

        // Setting location marker offset
        let offsetObj = getOffsetIncrement(locationStudentCount)
        offsetObj.student_id = newStudent.student_id
        offsetObj.location_id = dbLocationData.location_id
        await connection.query('INSERT INTO location_offset SET ?', [offsetObj])

        connection.release()
        return res.json({ message: 'New student added successfully!' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           PUT /admin/edit-student
// @desc            Edit student info
// @access          Private
router.put('/edit-student', authMiddleware, async (req, res) => {
    const { valid, errors } = validateNewStudentData(req.body)
    if (!valid) return res.status(400).json(errors)

    let {
        studentId,
        name,
        surname,
        graduated,
        description,
        location,
    } = req.body

    try {
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT * FROM student INNER JOIN location ON student.location_id = location.location_id WHERE student_id = ?',
            [studentId]
        )

        if (location.title === result[0][0].title) {
            await connection.query(
                'UPDATE student SET ? WHERE student_id = ?',
                [{ name, surname, graduated, description }, studentId]
            )

            connection.release()
            return res.json({ message: 'Student info successfully updated!' })
        }

        let result2 = await connection.query(
            'SELECT * FROM location WHERE title = ?',
            [location.title]
        )

        if (result2[0].length == 0) {
            const newLocation = {
                location_id: uuid.v4(),
                coordinate_x: location.coordinates[0],
                coordinate_y: location.coordinates[1],
                title: location.title,
                type: location.type,
                student_count: 1,
            }
            await connection.query('INSERT INTO location SET ?', [newLocation])
            await connection.query(
                'UPDATE student SET ? WHERE student_id = ?',
                [
                    {
                        name,
                        surname,
                        graduated,
                        description,
                        location_id: newLocation.location_id,
                    },
                    studentId,
                ]
            )

            if (result[0][0].student_count === 1) {
                await connection.query(
                    'DELETE FROM location WHERE location_id = ?',
                    [result[0][0].location_id]
                )
            } else {
                await connection.query(
                    'UPDATE location SET ? WHERE location_id = ?',
                    [
                        { student_count: result[0][0].student_count - 1 },
                        result[0][0].location_id,
                    ]
                )
            }
        } else {
            await connection.query(
                'UPDATE location SET ? WHERE location_id = ?',
                [
                    { student_count: result2[0][0].student_count + 1 },
                    result2[0][0].location_id,
                ]
            )
            await connection.query(
                'UPDATE student SET ? WHERE student_id = ?',
                [
                    {
                        name,
                        surname,
                        graduated,
                        description,
                        location_id: result2[0][0].location_id,
                    },
                    studentId,
                ]
            )

            if (result[0][0].student_count === 1) {
                await connection.query(
                    'DELETE FROM location WHERE location_id = ?',
                    [result[0][0].location_id]
                )
            } else {
                await connection.query(
                    'UPDATE location SET ? WHERE location_id = ?',
                    [
                        { student_count: result[0][0].student_count - 1 },
                        result[0][0].location_id,
                    ]
                )
            }
        }

        connection.release()
        return res.json({ message: 'Student info successfully updated!' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           POST /admin/delete-student
// @desc            Delete student
// @access          Private
router.post('/delete-student', authMiddleware, async (req, res) => {
    const student_id = req.body.studentId
    if (student_id === null || student_id === undefined) {
        return res.status(400).json({ message: 'Data not provided!' })
    }

    try {
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT student.location_id, location.student_count FROM student INNER JOIN location ON student.location_id = location.location_id WHERE student_id = ?',
            [student_id]
        )

        await connection.query('DELETE FROM student WHERE student_id = ?', [
            student_id,
        ])

        if (result[0][0].student_count === 1) {
            await connection.query(
                'DELETE FROM location WHERE location_id = ?',
                [result[0][0].location_id]
            )
        } else {
            await connection.query(
                'UPDATE location SET ? WHERE location_id = ?',
                [
                    { student_count: result[0][0].student_count - 1 },
                    result[0][0].location_id,
                ]
            )
        }
        connection.release()
        return res.json({ message: 'Student deleted successfully!' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

module.exports = router
