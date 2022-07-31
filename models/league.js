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