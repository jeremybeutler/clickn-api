const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const userRoutes = require('./api/routes/users')
const eventRoutes = require('./api/routes/events')
const clickRoutes = require('./api/routes/clicks')

    mongoose.connect(
        'mongodb+srv://clickn-admin:' + process.env.MONGO_ATLAS_PW + '@clickn-db-2zrbr.mongodb.net/test?retryWrites=true&w=majority',
        { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false }
    ).then(() => {
        console.log('Connected to mongodb')
    }).catch((err) => {
        console.log('Failed to connect to mongodb with error:', err)
    });

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