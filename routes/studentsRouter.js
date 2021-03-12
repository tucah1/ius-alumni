const router = require('express').Router()
const getConnection = require('../config/database')
const { randomDirection } = require('../util/helpers')

// @route           GET /students/locations
// @desc            Get all students locations
// @access          Public
router.get('/locations', async (req, res) => {
    try {
        const connection = await getConnection()
        let result = await connection.query('SELECT * FROM location')
        let locationData = {}
        result[0].forEach((x) => {
            locationData[x.location_id] = {
                student_count: x.student_count,
                coordinates: [x.coordinate_x, x.coordinate_y],
            }
        })
        result = await connection.query(
            'SELECT student_id, location_id FROM student'
        )
        let studentData = result[0]

        let finalData = []
        for (let i = 0; i < studentData.length; i++) {
            let x = studentData[i]
            let returnObj = { studentId: x.student_id }
            let customCoordinates = await randomDirection(
                locationData[x.location_id].coordinates
            )
            returnObj['coordinates'] = customCoordinates
            finalData.push(returnObj)
        }

        connection.release()
        return res.json(finalData)
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           GET /students
// @desc            Get all students info
// @access          Public
router.get('/', async (req, res) => {
    try {
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT * FROM student INNER JOIN location ON student.location_id = location.location_id'
        )

        let data = result[0].map((x) => {
            return {
                studentId: x.student_id,
                name: x.name,
                surname: x.surname,
                description: x.description,
                graduated: x.graduated,
                location: {
                    title: x.title,
                    type: x.type,
                    coordinates: [x.coordinate_x, x.coordinate_y],
                },
            }
        })

        connection.release()
        return res.json(data)
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           GET /student/:studentId
// @desc            Get student info
// @access          Public
router.get('/:student_id', async (req, res) => {
    const student_id = req.params.student_id

    try {
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT * FROM student INNER JOIN location ON student.location_id = location.location_id WHERE student_id = ?',
            [student_id]
        )
        let data = result[0][0]

        connection.release()
        return res.json({
            studentId: student_id,
            name: data.name,
            surname: data.surname,
            description: data.description,
            graduated: data.graduated,
            location: {
                title: data.title,
                type: data.type,
                coordinates: [data.coordinate_x, data.coordinate_y],
            },
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           GET /students/search/:search_text
// @desc            Search students by name, position or location
// @access          Public
router.get('/search/:search_text', async (req, res) => {})

module.exports = router
