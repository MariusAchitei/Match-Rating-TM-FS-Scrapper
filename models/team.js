const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamSchema = new mongoose.Schema({
    name: {
        type: String
    },
    logo: {
        type: String
    },
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League'
    },
    tablePos: {
        type: Number
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