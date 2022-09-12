mongoose = require('mongoose')

const Schema = mongoose.Schema;

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '0'
    },
    turnament: {
        type: Schema.Types.ObjectId,
        ref: 'League'
    },
    teams: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Team'
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
        },
    ]
})

module.exports = mongoose.model('Group', groupSchema);
