const express = require('express')
const app = express()
const cors = require('cors')

const adminRouter = require('./routes/adminRouter')
const studentRouter = require('./routes/studentsRouter')

const PORT = process.env.WEB_PORT || 5005

app.use(express.json({ extended: false }))
app.use(cors())

app.use('/api/admin', adminRouter)
app.use('/api/students', studentRouter)

app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT.toString(10) + '...')
})
