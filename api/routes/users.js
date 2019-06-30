const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const User = require('../models/user')

router.get('/', async (req, res, next) => {
    try {
        const users = await User.find()
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
        error: error
      });
    }
})

router.post('/', async (req, res, next) => {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        full_name: req.body.full_name,
        profile_image_path: req.body.profile_image_path,
        oauth: {
            service: req.body.oauth_service,
            service_username: req.body.oauth_service_username,
        },
        clicks: [],
        active_events: [],
        archived_events: []
    })
    try {
        await user.save()
        res.status(201).json({
            createdUser: user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const user = await User.findById(id)
        if (user) {
            res.status(200).json(user)
        } else {
            res.status(404).json({
                message: 'No entry found for provided ID'
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        let result = await User.remove({ _id: id })
        console.log(result)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

module.exports = router