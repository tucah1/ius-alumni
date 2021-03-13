const router = require('express').Router()
const getConnection = require('../config/database')
const { addUpOffsets } = require('../util/helpers')

// @route           GET /students/locations
// @desc            Get all students locations
// @access          Public
router.get('/locations', async (req, res) => {
    try {
        const connection = await getConnection()
        let result = await connection.query('SELECT * FROM location')
        let locationData = {}
        result[0].forEach((x) => {
            locationData[x.location_id] = [x.coordinate_x, x.coordinate_y]
        })
        result = await connection.query(
            'SELECT student_id, location_id FROM student'
        )
        let studentData = result[0]
        result = await connection.query('SELECT * FROM location_offset')
        let offsetData = {}
        result[0].forEach((x) => {
            offsetData[x.student_id] = [x.x, x.y]
        })

        let finalData = []
        for (let i = 0; i < studentData.length; i++) {
            let x = studentData[i]
            let customCoordinates = await addUpOffsets(
                locationData[x.location_id],
                offsetData[x.student_id]
            )
            finalData.push({
                studentId: x.student_id,
                coordinates: [customCoordinates[0], customCoordinates[1]],
            })
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
            'SELECT * FROM student AS s INNER JOIN location AS l ON s.location_id = l.location_id INNER JOIN location_offset as lo ON s.student_id = lo.student_id AND s.location_id = lo.location_id'
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
                    coordinates: addUpOffsets(
                        [x.coordinate_x, x.coordinate_y],
                        [x.x, x.y]
                    ),
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

// @route           GET /students/student/:studentId
// @desc            Get student info
// @access          Public
router.get('/student/:student_id', async (req, res) => {
    const student_id = req.params.student_id

    try {
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT * FROM student AS s INNER JOIN location AS l ON s.location_id = l.location_id INNER JOIN location_offset as lo ON s.student_id = lo.student_id AND s.location_id = lo.location_id WHERE s.student_id = ?',
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
                coordinates: addUpOffsets(
                    [data.coordinate_x, data.coordinate_y],
                    [data.x, data.y]
                ),
            },
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

// @route           GET /students/stats
// @desc            Get statistics from the app
// @access          Public
router.get('/stats', async (req, res) => {
    try {
        const connection = await getConnection()
        let result = await connection.query(
            'SELECT title, student_count FROM location'
        )
        let result2 = await connection.query(
            'SELECT SUM(student_count) as sum FROM location'
        )

        connection.release()

        let locs = result[0]
            .map((x) => [x.title, x.student_count])
            .sort((a, b) => (a[1] > b[1] ? -1 : 1))
        if (locs.length > 5) locs = locs.slice(0, 5)
        return res.json({
            numberOfStudents: result2[0][0].sum,
            locations: locs,
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
