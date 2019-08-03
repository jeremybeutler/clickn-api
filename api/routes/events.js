const express = require('express')
const router = express.Router()
// const mongoose = require('mongoose')

// const Event = require('../models/event')
// const EventConversationBucket = require('../models/event-conversation-bucket')
// const User = require('../models/user')

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

router.get('/search', async (req, res, next) => {
    try {
        let events = await Event.find({
            location: {
                $near: {
                    $maxDistance: req.body.search_radius,
                    $geometry: {
                        type: "Point",
                        coordinates: [req.body.longitude, req.body.lattitude]
                    }
                }
            }
        })
        res.status(200).json({
            events: events,
        })
    } catch (error) {
        res.status(404).json({
            error: error
        })
    }
})

router.post('/', async (req, res, next) => {
    let tags = []
    for (let tag in req.body.tags)
        tags.push(tag)

    try {
        const event = new Event({
            _id: new mongoose.Types.ObjectId(),
            users: [req.body.owner_id],
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
            datetime_close: req.body.datetime_close,
            status: "active"
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

        const user = await User.findByIdAndUpdate(req.body.owner_id,
            { "$push": { "active_events": event.id } 
        })

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

router.patch('/complete/:eventId', async (req, res, next) => {
    const event_id = req.params.eventId
        try {
            let event = await Event.findByIdAndUpdate(event_id,
                { "$set": { status: "complete" } }
            )  
            console.log(event.users)

            await User.updateMany({ _id: { $in: event.users } },
                { $pullAll: { active_events: [event_id] } },
            )

            await User.updateMany({ _id: { $in: event.users } },
                { $push: { reviewable_events:  event_id } }
            )

            res.status(200).json({
                event: event,
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: error
            })
        }
})

// Updates supplied user properties
router.patch('/:id', async (req, res, next) => {
    const id = req.params.id
    const updateOps = {}
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    try {
        let result = await Event.update({ _id: id }, { $set: updateOps })
        console.log(result)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})

module.exports = router