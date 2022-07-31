const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new mongoose.Schema({
    last: {
        type: String
    },
    first: {
        type: String
    },
    photo: {
        type: String
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    nat: {
        type: String
    },
    position: {
        type: String
    },
    num: {
        type: Number
    },
    goals: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Match'
        }
    ],
    motm: [
        {

            type: Schema.Types.ObjectId,
            ref: 'Match'

        }
    ]
})

module.exports = mongoose.model('Player', playerSchema);