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
    international: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
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
                return this.value >= 1000 ? `€${(this.value / 1000).toFixed(2)}m` : `€${this.value}mii`
            }
        },
        // updateValue: {
        //     set(function(value) {
        //         if (typeof (value) == 'number')
        //             this.set({ value })
        //     })
        // }
    }

})

module.exports = mongoose.model('Team', teamSchema);