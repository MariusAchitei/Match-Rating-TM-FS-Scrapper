mongoose = require('mongoose')

const Schema = mongoose.Schema;

const leagueSchema = new mongoose.Schema({
    name: {
        type: String
    },
    country: {
        type: String
    },
    tier: {
        type: Number
    },
    photo: {
        type: String,
        default: '/utils/not-defined'
    },
    url: {
        type: String
    },
    value: {
        type: Number,
        default: 0
    },
    teams: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        }
    ],
    played: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Match'
        }
    ],
    next: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Match'
        }
    ]

})

module.exports = mongoose.model('League', leagueSchema);