const mongoose = require('mongoose')

const Schema = mongoose.Schema;

matchSchema = new mongoose.Schema({
    date: {
        type: Date
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    hostForm: {
        type: Number
    },
    visit: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    visitForm: {
        type: Number
    },
    hostGoals: {
        player: {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        },
        minute: {
            type: Number,
            min: 0
        }
    },
    visitGoals: {
        player: {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        },
        minute: {
            type: Number,
            min: 0
        }
    },
    win: {
        type: {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        }
    }
})

module.exports = mongoose.model('Match', matchSchema);