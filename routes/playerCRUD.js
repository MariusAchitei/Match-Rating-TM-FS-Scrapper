const express = require('express');
const app = express();
const path = require('path')
const methodOverride = require('method-override');
const { League, Match, Player, Team } = require('../models/index.js')
const ejsMate = require('ejs-mate')
const axios = require('axios')
var bodyParser = require("body-parser");
const { updateTable, addMatches, updateValues } = require('../update')
const { AppError } = require('../utils/appError.js')
const catchAsync = require('../utils/catchAsync')
const { matchSchema, ratingSchema } = require('../schemas')
const router = express.Router()


router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const player = await Player.findById(id);

    res.render('edit-player', { player })
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    console.log('sal')

    const player = await Player.findById(id).populate('team')
    for (let i in player.team.squad) {
        if (player.team.squad[i] == player.id)
            player.team.squad.splice(i, 1)
    }
    await player.team.save()
    const team = player.team._id
    await Player.findByIdAndRemove(id)
    res.redirect(`/teams/${team}`)
}))

router.patch('/:id', catchAsync(async (req, res) => {

    const { id } = req.params;
    const { first, last, photo, team, num, position } = req.body

    //const leagues = await League.find({})
    let player = await Player.findById(id)
    // .populate('league', 'name')

    // res.render('editTeam', { echipa, leagues });
    if (team == player.team) {
        console.log('nu s a efectat');
        player = Object.assign(player, { first, last, photo, num, position })
    }
    else {
        console.log('Da');
        let newTeam
        if (team) { console.log('Da'); newTeam = await Team.findById(team) }
        else { newTeam = await Team.findById('62fd40e63857b206dc2c0c9c') }
        await Team.findOneAndUpdate({ _id: player.team }, { $pull: { squad: player._id } });
        player = Object.assign(player, { first, last, photo, team: newTeam, num, position })
        newTeam.squad.push(player);
        await newTeam.save()
    }


    await player.save()
    res.redirect(`/teams/${player.team}`)
}))

module.exports = router