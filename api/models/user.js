const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    full_name: String,
    profile_image_path: String, 
    oauth: {
        service: String,
        service_username: String,
    },
    // clicked_users: [{ type: Scheme.Types.ObjectId, ref: 'User'}],
    clicks: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Click' 
    }],
    active_events: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event' 
    }],
    archived_events: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event' 
    }],
})

module.exports = mongoose.model('User', userSchema)