const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Tag = require('../models/tag')

router.get('/', async (req, res, next) => {
    try {
        const tag = await Tag.find()
        res.status(200).json(tag);
    } catch (error) {
        res.status(500).json({
        error: error
      });
    }
})

router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const tag = await Tag.findById(id)
        if (tag) {
            res.status(200).json(tag)
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

router.post('/', async (req, res, next) => {
    try {
        const tag = new Tag({
            _id: new mongoose.Types.ObjectId(),
            text: req.body.title
        })

        await tag.save()
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
        let result = await Tag.remove({ _id: id })
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