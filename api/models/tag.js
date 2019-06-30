const mongoose = require('mongoose')

const tag = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    text: String,
})

module.exports = mongoose.model('Tag', tag)