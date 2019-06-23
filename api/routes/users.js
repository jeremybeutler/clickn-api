const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: "Handling GET requests to /users"
    })
})

router.post('/', (req, res, next) => {
    res.status(200).json({
        message: "Handling POST requests to /users"
    })
})

router.get('/:userId', (req, res, next) => {
    const id = req.params.productId
    res.status(200).json({
        message: "You passed an ID"
    })
})

module.exports = router