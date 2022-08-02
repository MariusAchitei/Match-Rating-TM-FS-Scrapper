const mongoose = require('mongoose')

const Schema = mongoose.Schema;

matchSchema = new mongoose.Schema({
    date: {
        type: Date
    },
    league: {
        type: Schema.Types.ObjectId,
        ref: 'League'
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    hostSquad: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }
    ],
    hostForm: {
        type: Number
    },
    visit: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    visitSquad: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }
    ],
    visitForm: {
        type: Number
    },
    hostGoals: [
        // player: {
        {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }
        // },
        // minute: {
        //     type: Number,
        //     min: 0
        // }
    ],
    visitGoals: [
        // player: {
        {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }
        // },
        // minute: {
        //     type: Number,
        //     min: 0
        // }
    ],
    win: {
        type: {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        }
    }
})

module.exports = mongoose.model('Match', matchSchema);