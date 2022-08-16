const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamSchema = new mongoose.Schema({
    name: {
        type: String
    },
    nameTM: {
        type: String
    },
    aliasName: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        default: ''
    },
    logo: {
        type: String
    },
    value: {
        type: Number,
        default: 0
    },
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
    },
    tableStats: {
        pcts: {
            type: Number
        },
        pos: {
            type: Number
        },
        played: {
            type: Number
        },
        scored: {
            type: Number
        },
        rec: {
            type: Number
        }

    },
    results: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
        }
    ],
    next: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Match'
        }
    ],
    squad: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player'
        }
    ]
})

module.exports = mongoose.model('Team', teamSchema);