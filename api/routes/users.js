const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const User = require('../models/user')
const Event = require('../models/event')

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

// Retreives user by id
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
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.get('/:id/activeEvents', async (req, res, next) => {
    const id = req.params.id
    try {
        let active_events = await User.findById(id)
            .populate('active_events')

        res.status(200).json(active_events)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.get('/:id/reviewableEvents', async (req, res, next) => {
    const id = req.params.id
    try {
        let reviewable_events = await User.findById(id)
            .populate('reviewable_events')

        res.status(200).json(reviewable_events)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.get('/:id/archivedEvents', async (req, res, next) => {
    const id = req.params.id
    try {
        let archived_events = await User.findById(id)
            .populate('archived_events')

        res.status(200).json(archived_events)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.get('/:id/clicks', async (req, res, next) => {
    const id = req.params.id
    try {
        let clicks = await User.findById(id)
            .populate('clicks')

        res.status(200).json(clicks)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

// Creates new clickn user account
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
        reviewable_events: [],
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

router.post('/:userId/reviewEvent/:eventId', async (req, res, next) => {
    try {
        let clicking_user = req.params.userId
        let reviewed_event = req.params.eventId
        let new_opt_ins = []
        let new_clicks = []
        let new_click_ids = []

        // Create opt-ins for each selected user
        for (let clicked_user in req.body.clicked_users) {
            const opt_in = new OptIn({
                _id: new mongoose.Types.ObjectId(),
                clicking_user: clicking_user,
                clicked_user: clicked_user,
                event: reviewed_event
            })
            await opt_in.save()
            new_opt_ins.push(opt_in)
        }

        // Find mutually opting users
        let matched_user_ids = await OptIn
            .find({
                event: reviewed_event, 
                clicking_user: { $in: [req.body.clicked_users]},
                clicked_user: clicking_user 
            })
            .select('_id');
        
        // Create click with each mutually opting user
        // Update clicks array for each mutually opting user
        matched_user_ids.forEach(async (matched_user) => {
            const click = new Click({
                _id: new mongoose.Types.ObjectId(),
                clicking_user: clicking_user,
                clicked_user: matched_user,
                event: reviewed_event
            })
            await click.save()

            await User.findByIdAndUpdate(matched_user, { 
                "$push": { "clicks": clicking_user }
            })

            new_clicks.push(click)
            new_click_ids.push(click.id)
        })

        // Update clicks array for clicking user
        await User.findByIdAndUpdate(clicking_user, 
            { "$push": { "clicks": { $each: new_click_ids } } }
        )

        // Archive the event for the clicking user
        let users = await User.updateOne({ _id: clicking_user },
            { "$pull": { "reviewable_events": { _id: reviewed_event } } },
            { "$push": { "archived_events": { $each: reviewed_event } } }
        )

        res.status(201).json({
            createdOptIns: new_opt_ins,
            generatedClicks: new_clicks,
            usersToNotify: matched_user_ids
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

// Updates supplied user properties
router.patch('/:id', async (req, res, next) => {
    const id = req.params.id
    const updateOps = {}
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    try {
        let result = await User.update({ _id: id }, { $set: updateOps })
        console.log(result)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})

router.patch('/:userId/joinEvent/:eventId', async (req, res, next) => {
    const userId = req.params.userId
    const eventId = req.params.eventId
    try {
        const user = await User.findByIdAndUpdate(userId,
            { "$push": { "active_events": eventId } 
        })
        const event = await Event.findByIdAndUpdate(eventId,
            { "$push": { "users": userId } 
        })
        res.status(200).json(
            {
                updatedUser: user,
                updatedEvent: event
            }
        )
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})

module.exports = router