const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamSchema = new mongoose.Schema({
    name: {
        type: String
    },
    nameTM: {
        type: String
    },
    nameFS: {
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
}, {
    virtuals: {
        valueString: {
            get() {
                if (this.value >= 1000000) return `€${(this.value / 1000 / 1000).toFixed(2)}bn.`
                return this.value >= 1000 ? `€${this.value / 1000}m` : `€${this.value}mii`
            }
        }
    }
})

module.exports = mongoose.model('Team', teamSchema);