const mongoose = require('mongoose')

const Schema = mongoose.Schema;

matchSchema = new mongoose.Schema({

    //  0: unused substitute
    // 1: starting eleven
    // 2: substituted
    // 3: sub in 


    // date: {
    //     type: String,
    //     default: '-'
    // },
    exactDate: {
        year: {
            type: Number,
            default: 2022
        },
        day: {
            type: Number,
            default: undefined
        },
        month: {
            type: Number,
            default: undefined
        },
        hour: {
            type: String,
            default: undefined
        },
    },
    url: {
        type: String
    },
    league: {
        type: Schema.Types.ObjectId,
        ref: 'League'
    },
    etapa: {
        type: String,
        default: '0'
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },

    hostSquad: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            },
            capitan: {
                type: Number,
                default: 0
            },
            status: {
                type: Number,
                default: 0
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
    // hostForm: {
    //     type: Number
    // },
    visit: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },

    visitSquad: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            },
            capitan: {
                type: Number,
                default: 0
            },
            status: {
                type: Number,
                default: 0
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
    // visitForm: {
    //     type: Number
    // },
    hostScore: {
        type: String,
        default: '-'
    },
    goals: {
        host: [
            {
                player:
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Player'
                },
                minute: {
                    type: Number,
                    min: 0
                }
            }
        ],
        visit: [
            {
                player: {

                    type: Schema.Types.ObjectId,
                    ref: 'Player'

                },
                minute: {
                    type: Number,
                    min: 0
                }
            }
        ],
    },
    visitScore: {
        type: String,
        default: '-'
    },
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
}, {
    virtuals: {
        status: {
            get() {
                if ((this.hostScore == '-' && this.visitScore == '-') || (this.hostScore == '' && this.visitScore == ''))
                    return 0
                return 1
            }
        },
        date: {
            get() {
                function monthToString(month) {
                    if (month == 1) return 'Ian'
                    if (month == 2) return 'Feb'
                    if (month == 3) return 'Mar'
                    if (month == 4) return 'Apr'
                    if (month == 5) return 'Mai'
                    if (month == 6) return 'Iun'
                    if (month == 7) return 'Iul'
                    if (month == 8) return 'Aug'
                    if (month == 9) return 'Sep'
                    if (month == 10) return 'Oct'
                    if (month == 11) return 'Noi'
                    if (month == 12) return 'Dec'
                }
                return `${this.exactDate.day}. ${monthToString(this.exactDate.month)}. ${this.exactDate.year}  ${this.exactDate.hour ? this.exactDate.hour : ''}`
            }
        }
    }
})

module.exports = mongoose.model('Match', matchSchema);