const express = require('express')
const router = express.Router()
const mongodb = require('mongodb')
const mongodb_connect = require('../../mongodb-connect');

const User = mongodb_connect.db.collection('users');
const Event = mongodb_connect.db.collection('events')
const OptIn = mongodb_connect.db.collection('optins')
const Click = mongodb_connect.db.collection('clicks')

router.get('/', async (req, res, next) => {
    try {
        const users = await User.find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
})

// Retreives user by id
router.get('/:id', async (req, res, next) => {
    // const id = req.params.id
    const id = new mongodb.ObjectID(req.params.id);
    try {
        const user = await User.findOne({
            _id: id
        })

        if (user) {
            res.status(200).json(user)
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

// Retrieves active events for a given user
router.get('/:id/activeEvents', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id)
    try {
        let active_events = await User.aggregate([
            { $project: {
                "active_events": 1
            }},
            { $match: {
                "_id": id
            }},
            { $lookup: {
                from: "events",
                localField: "active_events",
                foreignField: "_id",
                as: "active_events"
            }}
        ]).toArray()
        active_events = active_events[0].active_events

        res.status(200).json({
            status: "true",
            data: active_events
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "false",
            error: error
        })
    }
})

// Retrieves reviewable events for a given user
router.get('/:id/reviewableEvents', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id)
    try {
        let reviewable_events = await User.aggregate([
            { $project: {
                "reviewable_events": 1
            }},
            { $match: {
                "_id": id
            }},
            { $lookup: {
                from: "events",
                localField: "reviewable_events",
                foreignField: "_id",
                as: "reviewable_events"
            }}
        ]).toArray()
        reviewable_events = reviewable_events[0].reviewable_events

        res.status(200).json(reviewable_events)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

// Retrieves archived events for a given user
router.get('/:id/archivedEvents', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id)
    try {
        let archived_events = await User.aggregate([
            { $project: {
                "archived_events": 1
            }},
            { $match: {
                "_id": id
            }},
            { $lookup: {
                from: "events",
                localField: "archived_events",
                foreignField: "_id",
                as: "archived_events"
            }}
        ]).toArray()
        archived_events = archived_events[0].archived_events

        res.status(200).json(archived_events)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

// Retrieves click objects for a given user
router.get('/:id/clicks', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id);
    try {
        let clicks = await User.aggregate([
            { $project: {
                "clicks" : 1
            }},
            { $match: {
                "_id": id
            }}, 
            { $lookup: {
                from: "clicks",
                localField: "clicks",
                foreignField: "_id",
                as: "clicks"
            }}
        ]).toArray()
        clicks = clicks[0].clicks

        res.status(200).json(clicks)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

// DELETE ME !!! ONLY USED FOR IT OS PROJECT SINCE JAVA DOESN'T LIKE PATCH
router.get('/:userId/joinEvent/:eventId', async (req, res, next) => {
    const user_oid = new mongodb.ObjectID(req.params.userId)
    const event_oid = new mongodb.ObjectID(req.params.eventId)
    try {

        // NEED TO CHECK IF USER ALREADY HAS EVENT
        
        const user = await User.findOneAndUpdate(
            { _id: user_oid },
            { $push: { active_events: event_oid } },
            { returnOriginal: false }
        )
        const event = await Event.findOneAndUpdate(
            { _id: event_oid },
            { $push: { users: user_oid } },
            { returnOriginal: false }
        )
        res.status(200).json({
            updatedUser: user.value,
            updatedEvent: event.value
        })
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})

// Adds user to existing event
router.patch('/:userId/joinEvent/:eventId', async (req, res, next) => {
    const user_oid = new mongodb.ObjectID(req.params.userId)
    const event_oid = new mongodb.ObjectID(req.params.eventId)
    try {

        // NEED TO CHECK IF USER ALREADY HAS EVENT
        
        const user = await User.findOneAndUpdate(
            { _id: user_oid },
            { $push: { active_events: event_oid } },
            { returnOriginal: false }
        )
        const event = await Event.findOneAndUpdate(
            { _id: event_oid },
            { $push: { users: user_oid } },
            { returnOriginal: false }
        )
        res.status(200).json({
            updatedUser: user.value,
            updatedEvent: event.value
        })
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})

router.post('/:id/reviewEvent/:eventId', async (req, res, next) => {
    try {
        let clicked_users = req.body.clicked_users
        let clicked_users_oids = clicked_users.map(x => new mongodb.ObjectID(x))
        let clicking_user_oid = new mongodb.ObjectID(req.params.id)
        let reviewed_event_oid = new mongodb.ObjectID(req.params.eventId)
        var new_click_oids = []

        // Create opt-ins for each selected user
        for (const clicked_user of clicked_users) {
            const clicked_user_oid = new mongodb.ObjectID(clicked_user)
            let opt_in = await OptIn.insertOne({
                clicking_user: clicking_user_oid,
                clicked_user: clicked_user_oid,
                event: reviewed_event_oid
            });
        }

        // Find mutually opting users
        let matched_opt_ins = await OptIn.find({
            event: reviewed_event_oid, 
            clicked_user: clicking_user_oid,
            clicking_user: { $in: clicked_users_oids }
        })
        .project({ clicking_user: 1 })
        .toArray();

        // Create click with clicking user and each mutually opting user
        // Update clicks array for each mutually opting user
        for (const matched_opt_in of matched_opt_ins) {
            const matched_clicking_user_oid = new mongodb.ObjectID(matched_opt_in.clicking_user)
            let click = await Click.insertOne({
                user_1: clicking_user_oid,
                user_2: matched_clicking_user_oid,
                shared_events: [reviewed_event_oid],
                created: new Date().getTime(),
                conversation: {
                    _id: new mongodb.ObjectId(),
                    created: new Date(),
                }
            })
            let click_oid = new mongodb.ObjectID(click.ops[0]._id)

            await User.findOneAndUpdate(
                { _id: matched_clicking_user_oid },
                { $push: { clicks: click_oid } },
            )
            new_click_oids.push(click_oid)
        }

        // Update clicks array for clicking user
        // Archive the event for the clicking user
        await User.findOneAndUpdate(
            { _id: clicking_user_oid },
            { 
                $addToSet: { clicks: { $each: new_click_oids } }, 
                $pull: { reviewable_events: reviewed_event_oid },
                $push: { archived_events: reviewed_event_oid }
            }
        )
        res.status(200).json({
            newClicks: new_click_oids
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

// Creates new clickn user account
router.post('/', async (req, res, next) => {
    try {
        let user = await User.insertOne({
            full_name: req.body.full_name,
            profile_image_path: req.body.profile_image_path,
            outh: {
                service: req.body.oauth_service,
                service_username: req.body.oauth_service_username
            },
            clicks: [],
            active_events: [],
            reviewable_events: [],
            archived_events: []
        });
        res.status(201).json({
            createdUser: user.ops[0]
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

// Removes user by id
router.delete('/:id', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id)
    try {
        let result = await User.remove({ 
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


module.exports = router