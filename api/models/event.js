// TODO: figure out how guests will be handled in our system. people will want to bring others without the app but those people can't participate in clicking like everyone else unless they have an account

const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    capacity: Number,
    title: String,
    description: String,
    tags: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tag'
    }],
    group_type: String,
    location: {
      type: { type: String },
      coordinates: [Number]
    },
    datetime_start: Date,
    datetime_end: Date,
    datetime_close: Date,
    status: String
})

eventSchema.index({
  'location': '2dsphere'
})

module.exports = mongoose.model('Event', eventSchema)