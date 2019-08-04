const express = require('express')
const router = express.Router()

let mongodb_connect = require('../../mongodb-connect');
console.log(mongodb_connect.db)

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

router.post('/:userId/reviewEvent/:eventId', async (req, res, next) => {
    try {
        let clicking_user = req.params.userId
        let reviewed_event = req.params.eventId
        let new_opt_ins = []
        let new_clicks = []
        let new_click_ids = []
        let new_click__ids = []
        // console.log(req.body.clicked_users)

        // Create opt-ins for each selected user
        req.body.clicked_users.forEach(async (clicked_user) => {
            const opt_in = new OptIn({
                _id: new mongoose.Types.ObjectId(),
                clicking_user: clicking_user,
                clicked_user: clicked_user,
                event: reviewed_event
            })
            await opt_in.save()
            new_opt_ins.push(opt_in)
        })

        // Find mutually opting users
        let matched_opt_ins = await OptIn
            .find({
                event: reviewed_event, 
                clicked_user: clicking_user,
                clicking_user: { $in: req.body.clicked_users }
            })
            .select('clicking_user');
        
        console.log('matched_opt_ins')
        console.log(matched_opt_ins)
        
        // Create click with each mutually opting user
        // Update clicks array for each mutually opting user
        matched_opt_ins.forEach(async (matched_opt_in) => {
            let matched_clicking_user = matched_opt_in.clicking_user
            let click = new Click({
                _id: new mongoose.Types.ObjectId(),
                user_1: clicking_user,
                user_2: matched_clicking_user,
                shared_events: [reviewed_event]
            })
            await click.save()
            click_id = click.id

            await User.findByIdAndUpdate(matched_clicking_user, { 
                $push: { clicks: click_id }
            })

            new_clicks.push(click)
            new_click_ids.push(click_id)
        })

        console.log(new_click_ids)

        // Update clicks array for clicking user
        await User.findByIdAndUpdate(clicking_user, 
            { $push: { clicks: { $each: new_click_ids } } }
        )

        // Archive the event for the clicking user
        await User.updateOne({ _id: clicking_user },
            { $pullAll: { reviewable_events: [reviewed_event] } }
        )

        await User.updateOne({ _id: clicking_user },
            { $push: { archived_events: reviewed_event } }
        )

        res.status(201).json({
            createdOptIns: new_opt_ins,
            generatedClicks: new_clicks,
            usersToNotify: matched_opt_ins
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

router.get('/:id/activeEvents', async (req, res, next) => {
    // console.log('here')
    const id = req.params.id
    try {
        let active_events = await User.findById(id)
        .populate('active_events')
        .select('active_events');

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
            .select('reviewable_events')

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
            .select('archived_events')

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
            { $push: { active_events: eventId } 
        })
        const event = await Event.findByIdAndUpdate(eventId,
            { $push: { users: userId } 
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