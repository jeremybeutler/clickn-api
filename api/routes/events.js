const express = require('express')
const router = express.Router()
const mongodb = require('mongodb')
const mongodb_connect = require('../../mongodb-connect');

const Event = mongodb_connect.db.collection('events')
const User = mongodb_connect.db.collection('users')

router.get('/', async (req, res, next) => {
    try {
        const events = await Event.find({}).toArray()
        res.status(200).json({
            status: "true",
            data: events
        });
    } catch (error) {
        res.status(500).json({
            status: "false",
            error: error
      });
    }
})

// Retrieves a list of active events
router.post('/search', async (req, res, next) => {
    try {
        const events = await Event.find(
            { location:
                { $near :
                    {
                        $geometry: { type: "Point",  coordinates: [ req.body.longitude, req.body.latitude ] },
                        $maxDistance: req.body.search_radius
                    }
                }
            }
        ).toArray()

        console.log(events)
        res.status(200).json({
            events: events,
        })
    } catch (error) {
        res.status(404).json({
            error: error
        })
    }
})

router.get('/:id', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id)
    try {
        const event = await Event.findOne({
            _id: id
        })
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

router.patch('/complete/:eventId', async (req, res, next) => {
    const event_oid = new mongodb.ObjectID(req.params.eventId)
    try {
        let event = await Event.findOneAndUpdate(
            { _id: event_oid },
            { $set: { status: "complete" } }
        )
        let event_users = event.value.users
        console.log(event_users)

        await User.updateMany(
            { _id: { $in: event_users } },
            { $pullAll: { active_events: [event_oid] } },
        )
        await User.updateMany(
            { _id: { $in: event_users } },
            { $push: { reviewable_events:  event_oid } }
        )
        res.status(200).json({
            event: event.value
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.post('/', async (req, res, next) => {
    let owner_oid = new mongodb.ObjectId(req.body.owner_id)
    let tags = []
    for (let tag in req.body.tags)
        tags.push(tag)

    try {
        const event = await Event.insertOne({
            users: [owner_oid],
            owner: owner_oid,
            capacity: req.body.capacity,
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags,
            group_type: req.body.group_type,
            datetime_start: req.body.datetime_start,
            datetime_end: req.body.datetime_end,
            datetime_open: req.body.datetime_open,
            datetime_close: req.body.datetime_close,
            status: 'active',
            location: {
                type: 'Point',
                coordinates: [
                    req.body.longitude,
                    req.body.latitude
                ]
            },
            conversation: {
                _id: new mongodb.ObjectId(),
                created: new Date(),
            }
        })
        let event_oid = new mongodb.ObjectId(event.ops[0]._id)
        const user = await User.findOneAndUpdate(
            { _id: owner_oid },
            { $push: { active_events: event_oid } }
        )

        res.status(200).json({
            createdEvent: event_oid
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.delete('/:id', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id)
    try {
        let result = await Event.remove({ 
            _id: id 
        })
        console.log(result)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

// Updates supplied user properties
// router.patch('/:id', async (req, res, next) => {
//     const id = req.params.id
//     const updateOps = {}
//     for (const ops of req.body) {
//         updateOps[ops.propName] = ops.value;
//     }
//     try {
//         let result = await Event.update({ _id: id }, { $set: updateOps })
//         console.log(result)
//         res.status(200).json(result)
//     } catch (error) {
//         res.status(500).json({
//             error: error
//         })
//     }
// })

module.exports = router