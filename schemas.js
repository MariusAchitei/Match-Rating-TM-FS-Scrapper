const Joi = require('joi')

module.exports.ratingSchema = Joi.object({
    meci: Joi.required(),
    team: Joi.required(),
    note: Joi.required(),
    potm: Joi.required(),
})

module.exports.matchSchema = Joi.object({
    host_id: Joi.required(),
    visit_id: Joi.required(),
    host_players: Joi.array().min(11).required(),
    visit_players: Joi.array().min(11).required(),
    host_goals: Joi.optional(),
    visit_goals: Joi.optional(),
    league: Joi.required()
})