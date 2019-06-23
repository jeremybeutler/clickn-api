// const express = require('express')
// const bodyParser = require('body-parser')

// const app = express()
// app.use(bodyParser.json())
// app.user(bodyParser.urlencoded({
//     extended: false
// }))

// const mongoose = require('mongoose')

// mongoose.connect('mongodb://localhost:27017/clickn', {
//     useNewUrlParser: true
// })

// const users = require("./users.js");
// app.use("/api/users", users.routes);

// app.listen(3001, () => console.log('Server listening at port 3001!'))

// 
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const userRoutes = require('./api/routes/users')

app.use(bodyParser.urlencoded({
        extended: false
    })
)
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