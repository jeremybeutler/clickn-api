const express = require('express')
const router = express.Router()
const mongodb = require('mongodb')
const mongodb_connect = require('../../mongodb-connect');

const Event = mongodb_connect.db.collection('events')
const User = mongodb_connect.db.collection('users')

const mbxClient = require('@mapbox/mapbox-sdk');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const baseClient = mbxClient({ accessToken: "pk.eyJ1IjoiY2xpY2tuIiwiYSI6ImNrNTRlaGEyOTBpbDIzbG50N3I4MDA2Z28ifQ.7ZpTOY97E8FnnguaWxx-pA" });
const geocodingService = mbxGeocoding(baseClient);

router.get('/', async (req, res, next) => {
    const validStatusValues = ["active", "complete", "archived"]
    var queryOps = {}
    if (req.query.hasOwnProperty('status')) {
        if (validStatusValues.includes(req.query.status)) {
            queryOps.status = req.query.status
        } else {
            res.status(400).json({
                status: "false",
                error: "Invalid value provided for event status."
            });
        }
    }
    if (req.query.hasOwnProperty('longitude') && req.query.hasOwnProperty('latitude') && req.query.hasOwnProperty('search_radius')) {
        queryOps.location = { 
            $near: {
                $geometry: { 
                    type: "Point", coordinates: [ parseFloat(req.query.longitude), parseFloat(req.query.latitude) ] 
                },
                $maxDistance: parseFloat(req.query.search_radius)
            }
        }
    }
    try {
        const events = await Event.find(queryOps).toArray()
        res.status(200).json({
            status: "true",
            events: events
        });
    } catch (error) {
        res.status(500).json({
            status: "false",
            error: error
        });
    }
})

router.get('/active', async (req, res, next) => {
    try {
        const active_events = await Event.find(
            {
                status: "active"
            }
        )
        res.status(200).json({
            status: "true",
            events: active_events
        })
    } catch (error) {
        res.status(500).json({
            status: "false",
            error: error
      });
    }
})

// Retrieves a list of active events within a search radius
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
        let reverseGeocodedAddress = await geocodingService.reverseGeocode({
            query: [req.body.longitude, req.body.latitude],
            limit: 1
        }).send()
        
        if (reverseGeocodedAddress.body.features.length) {
            reverseGeocodedAddress = reverseGeocodedAddress.body.features[0].place_name
        } else {
            reverseGeocodedAddress = null
        }

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
            street_address: reverseGeocodedAddress,
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