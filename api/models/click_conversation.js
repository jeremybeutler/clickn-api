const mongoose = require('mongoose')

const message = new Schema({
    posted: Date,
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    body: String,
})

const clickConversationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    click_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Click' 
    },
    bucket: Number,
    count: Number,
    messages: [{message}],
})

module.exports = mongoose.model('ClickConversation', clickConversationSchema)