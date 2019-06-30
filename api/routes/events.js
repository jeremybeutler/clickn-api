const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Event = require('../models/event')
const EventConversationBucket = require('../models/event_conversation_bucket')

router.get('/', async (req, res, next) => {
    try {
        const event = await Event.find()
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({
        error: error
      });
    }
})

router.post('/', async (req, res, next) => {
    let tags = []
    for (let tag in req.body.tags)
        tags.push(tag)


    try {
        const event = new Event({
            _id: new mongoose.Types.ObjectId(),
            users: [],
            owner: req.body.owner_id,
            capacity: req.body.capacity,
            title: req.body.tile,
            description: req.body.description,
            tags: req.body.tags,
            group_type: req.body.group_type,
            location: {
                type: 'Point',
                coordinates: [
                    req.body.longitude,
                    req.body.latitude
                ]
            },
            datetime_start: req.body.datetime_start,
            datetime_end: req.body.datetime_end,
            datetime_open: req.body.datetime_open,
            datetime_close: req.body.datetime_close
        })

        await event.save()
       
        const event_conversation = new EventConversationBucket({
            _id: new mongoose.Types.ObjectId(),
            event_id: event.id,
            bucket: 0,
            count: 0,
            messages: []
        })

        await event_conversation.save()

        res.status(201).json({
            createdEvent: event,
            createdEventConversationBucket: event_conversation
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
        const event = await Event.findById(id)
        if (event) {
            res.status(200).json(event)
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
        let result = await Event.remove({ _id: id })
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