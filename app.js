let mongodb_connect = require('./mongodb-connect.js');
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const userRoutes = require('./api/routes/users')
const eventRoutes = require('./api/routes/events')
const clickRoutes = require('./api/routes/clicks')
const optinRoutes = require('./api/routes/opt-in')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    )
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})

app.use('/users', userRoutes)
app.use('/events', eventRoutes)
app.use('/clicks', clickRoutes)
app.use('/optins', optinRoutes)

app.use((req, res, next) => {
    const error = new Error('Not found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;