const mongoose = require('mongoose')

const Schema = mongoose.Schema;

matchSchema = new mongoose.Schema({
    date: {
        type: String,
        default: '-'
    },
    league: {
        type: Schema.Types.ObjectId,
        ref: 'League'
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    // hostSquad: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Player'
    //     }
    // ],
    hostSquad: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            },

            nota: {
                type: Number,
                default: 0
            },
            voturi: {
                type: Number,
                default: 0
            },

            potm: {
                voturi: {
                    type: Number,
                    default: 0
                }
            },
        }
    ],
    hostForm: {
        type: Number
    },
    visit: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    // visitSquad: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Player'
    //     }
    // ],
    visitSquad: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            },

            nota: {
                type: Number,
                default: 0
            },
            voturi: {
                type: Number,
                default: 0
            },

            potm: {
                id: {
                    type: Schema.Types.ObjectId,
                    ref: 'Player'
                },
                voturi: {
                    type: Number,
                    default: 0
                }
            },
        }
    ],
    visitForm: {
        type: Number
    },
    hostScore: {
        type: String
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
    visitScore: {
        type: String
    },
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
    hostPotm:
    {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        },
        curent: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    },
    visitPotm:
    {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        },
        curent: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
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