const mongoose = require('mongoose');

const League = require('./league.js')
const Match = require('./match.js')
const Player = require('./player.js')
const Team = require('./team.js')
const Turnament = require('./turnament.js')
const Group = require('./group.js')

module.exports = { League, Match, Player, Team, Turnament, Group };