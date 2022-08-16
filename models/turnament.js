mongoose = require('mongoose')

const Schema = mongoose.Schema;

const turnamentSchema = new mongoose.Schema({
    name: {
        type: String
    },
    country: {
        type: String
    },
    url: {
        type: String
    },
    value: {
        type: Number,
        default: 0
    },
    rounds: [{
        stage: {
            type: String
        },
        pair: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Team'
            }
        ],
        firstLeg:
        {
            type: Schema.Types.ObjectId,
            ref: 'Match'
        },

        secondLeg:
        {
            type: Schema.Types.ObjectId,
            ref: 'Match'
        }

    }],

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

module.exports = mongoose.model('Turnament', turnamentSchema);