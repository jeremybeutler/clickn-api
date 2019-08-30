const express = require('express')
const router = express.Router()
const mongodb = require('mongodb')
const mongodb_connect = require('../../mongodb-connect');

const Click = mongodb_connect.db.collection('clicks')
const Event = mongodb_connect.db.collection('event')

// Todo:
// Add shared event

router.get('/', async (req, res, next) => {
    try {
        const clicks = await Click.find({}).toArray()
        res.status(200).json(clicks);
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
})

router.get('/:id', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id)
    try {
        const click = await Click.findOne({
            _id: id
        })
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

router.patch('/:id/addSharedEvent/:eventId', async (req, res, next) => {
    const oid = new mongodb.ObjectID(id)
    const event_oid = new mongodb.ObjectID(eventId)
    try {
        let click = await Event.findOneAndUpdate(
            { _id: oid },
            { $push: { shared_events: event_oid } }
        )
        res.status(200).json({
            updatedEvent: click.value
        })
    } catch (error) {

    }
})

router.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        let result = await Click.remove({ 
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