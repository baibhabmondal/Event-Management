const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const UserSchema = new Schema({
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdEvents: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Event'
        }
    ]

});

module.exports = mongoose.model('User', UserSchema);