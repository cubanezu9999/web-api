require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const map = require('./controllers/mapController.js');
const users = require('./controllers/userController.js');


app.use('/', map)
app.use('/', users)
app.use(cors())







app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`)
})