const express = require('express')
const router = express.Router()
const mongodb = require('mongodb')
const mongodb_connect = require('../../mongodb-connect');

const Tag = mongodb_connect.db.collection('tags')

router.get('/', async (req, res, next) => {
    try {
        const tags = await Tag.find({}).toArray();
        res.status(200).json({
            status: "true",
            tags: tags
        });
    } catch (error) {
        res.status(500).json({
            status: "false",
            error: error
        });
    }
})

// Retreives tag by id
router.get('/:id', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id);
    try {
        const tag = await Tag.findOne({
            _id: id
        })

        if (tag) {
            res.status(200).json(tag)
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

// Creates new tag
router.post('/', async (req, res, next) => {
    try {
        let tag = await Tag.insertOne({
            name: req.body.name
        });
        res.status(201).json({
            createdTag: tag.ops[0]
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error
        })
    }
})

// Removes tag by id
router.delete('/:id', async (req, res, next) => {
    const id = new mongodb.ObjectID(req.params.id)
    try {
        let result = await Tag.remove({ 
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