const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const playerSchema = new mongoose.Schema({
    last: {
        type: String
    },
    first: {
        type: String
    },
    value: {
        type: Number,
        default: 0
    },
    photo: {
        type: String
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    nat: [
        {
            country: {
                type: String,
                default: 'Unknown'
            },
            img: {
                type: String,
                default: ''
            }
        }
    ],
    born: {
        year: {
            type: Number,
            default: undefined
        },
        day: {
            type: Number,
            default: undefined
        },
        month: {
            type: String,
            default: undefined
        },
        age: {
            type: Number,
            default: undefined
        },
    },
    data: {
        type: String,
        default: '-'
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

module.exports = mongoose.model('Player', playerSchema);