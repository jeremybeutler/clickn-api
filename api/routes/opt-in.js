const express = require('express')
const router = express.Router()
const mongodb = require('mongodb')
const mongodb_connect = require('../../mongodb-connect');

const OptIn = mongodb_connect.db.collection('optins')

router.get('/', async (req, res, next) => {
    try {
        const optins = await OptIn.find({}).toArray()
        res.status(200).json({
            status: "true",
            data: optins
        });
    } catch (error) {
        res.status(500).json({
            status: "false",
            error: error
      });
    }
})

router.get('/:id', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id)
    try {
        const optin = await OptIn.findOne({
            _id: id
        })
        if (optin) {
            res.status(200).json(optin)
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
    const id = new mongodb.ObjectID(req.params.id)
    try {
        let result = await Option.remove({ 
            _id: id 
        })
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

module.exports = router