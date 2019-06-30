const mongoose = require('mongoose')

const message = new mongoose.Schema({
    posted: Date,
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    body: String,
})

const eventConversationBucketSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    event_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event' 
    },
    bucket: Number,
    count: Number,
    messages: [{message}],
})

module.exports = mongoose.model('EventConversationBucket', eventConversationBucketSchema)