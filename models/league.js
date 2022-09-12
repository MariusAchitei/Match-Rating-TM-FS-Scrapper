mongoose = require('mongoose')

const Schema = mongoose.Schema;

const leagueSchema = new mongoose.Schema({
    name: {
        type: String
    },
    country: {
        type: String
    },
    turnament: {
        type: Number,
        default: 0
    },
    groups: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Group'
        }
    ],
    tier: {
        type: Number
    },
    photo: {
        type: String,
        default: '/utils/not-defined'
    },
    url: {
        type: String,
        default: ''
    },
    urlFS: {
        type: String,
        default: ''
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

module.exports = mongoose.model('League', leagueSchema);