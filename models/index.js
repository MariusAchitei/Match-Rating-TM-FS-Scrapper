const mongoose = require('mongoose');

const League = require('./league.js')
const Match = require('./match.js')
const Player = require('./player.js')
const Team = require('./team.js')

module.exports = { League, Match, Player, Team };