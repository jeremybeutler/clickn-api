const express = require('express')
const router = express.Router()
// const mongoose = require('mongoose')

// const OptIn = require('../models/opt-in')

router.get('/', async (req, res, next) => {
    try {
        const opt_in = await OptIn.find()
        res.status(200).json(opt_in);
    } catch (error) {
        res.status(500).json({
        error: error
      });
    }
})

// router.post('/', async (req, res, next) => {
//     try {
//         const opt_in = new OptIn({
//             _id: new mongoose.Types.ObjectId(),
//             clicking_user: req.body.clicking_user_id,
//             clicked_user: req.body.clicked_user_id,
//             event: req.body.event_id
//         })

//         await opt_in.save()
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             error: error
//         })
//     }
// })

router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const opt_in = await OptIn.findById(id)
        if (opt_in) {
            res.status(200).json(opt_in)
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

// router.delete('/:id', async (req, res, next) => {
//     const id = req.params.id
//     try {
//         let result = await OptIn.remove({ _id: id })
//         console.log(result)
//         res.status(200).json(result)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             error: error
//         })
//     }
// })

module.exports = router