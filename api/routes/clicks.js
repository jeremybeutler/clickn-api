const express = require('express')
const router = express.Router()
// const mongoose = require('mongoose')

// const Click = require('../models/click')
// const ClickConversationBucket = require('../models/click-conversation-bucket')

router.get('/', async (req, res, next) => {
    try {
        const click = await Click.find()
        res.status(200).json(click);
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
})

router.post('/', async (req, res, next) => {
    try {
        const click = new Click({
            _id: new mongoose.Types.ObjectId(),
            user_1: req.body.user_1,
            user_2: req.body.user_2,
            shared_events: [req.body.first_event]
        })

        await click.save()

        const click_conversation_bucket = new ClickConversationBucket({
            _id: new mongoose.Types.ObjectId(),
            click_id: click.id,
            bucket: 0,
            count: 0,
            messages: []
        })

        await click_conversation_bucket.save()

        res.status(201).json({
            createdClick: event,
            createdClickConversationBucket: click_conversation_bucket
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
        const click = await Click.findById(id)
        if (click) {
            res.status(200).json(click)
        } else {
            res.status(404).json({
                message: 'No entry found for provided ID'
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        let result = await Click.remove({ _id: id })
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