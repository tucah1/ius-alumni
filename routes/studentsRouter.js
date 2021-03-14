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

// @route           GET /students/list-all/:page_no/:item_limit
// @desc            Get all students info
// @access          Public
router.get('/list-all/:page_no/:item_limit', async (req, res) => {
    try {
        let { page_no, item_limit } = req.params
        page_no = parseInt(page_no)
        item_limit = parseInt(item_limit)

        const connection = await getConnection()
        let countResult = await connection.query(
            'SELECT COUNT(student_id) as count FROM student'
        )
        let numberOfPages = Math.ceil(countResult[0][0].count / item_limit)
        let result = await connection.query(
            'SELECT * FROM student AS s INNER JOIN location AS l ON s.location_id = l.location_id INNER JOIN location_offset as lo ON s.student_id = lo.student_id AND s.location_id = lo.location_id ORDER BY s.name LIMIT ?,?',
            [(page_no - 1) * item_limit, item_limit]
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
        return res.json({
            pages_number: numberOfPages,
            current_page: page_no,
            data,
        })
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
router.get('/search/:search_text', async (req, res) => {
    let search_text = req.params.search_text
    if (!search_text || search_text.trim().length < 3) {
        return res.status(400).json({
            message: 'Bad request! Please include valid search parameter!',
        })
    }

    try {
        let tokens = search_text.trim().split('+')
        tokens = tokens.filter((token) => token !== '')
        let queryString = tokens.join(' ')

        const connection = await getConnection()
        let result = await connection.query(
            'SELECT * FROM student AS s INNER JOIN location AS l ON s.location_id = l.location_id INNER JOIN location_offset as lo ON s.student_id = lo.student_id AND s.location_id = lo.location_id'
        )
        let students = []

        result[0].forEach((student) => {
            let fullName = student.name + ' ' + student.surname
            let matchRatio = 0
            if (fullName.toLowerCase().includes(queryString.toLowerCase())) {
                matchRatio += queryString.length / fullName.length
            }
            if (matchRatio > 0)
                students.push({
                    studentId: student.student_id,
                    name: student.name,
                    surname: student.surname,
                    description: student.description,
                    graduated: student.graduated,
                    matchRatio,
                    location: {
                        title: student.title,
                        type: student.type,
                        coordinates: addUpOffsets(
                            [student.coordinate_x, student.coordinate_y],
                            [student.x, student.y]
                        ),
                    },
                })
        })
        students = students.sort((a, b) =>
            a.matchRatio > b.matchRatio ? -1 : 1
        )
        connection.release()
        return res.json({ students })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ error: e })
    }
})

module.exports = router
