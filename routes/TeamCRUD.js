const express = require('express');
const app = express();
const path = require('path')
const router = express.Router()

var bodyParser = require("body-parser");
const { AppError } = require('../utils/appError.js')
const catchAsync = require('../utils/catchAsync')
const { matchSchema, ratingSchema } = require('../schemas')
const methodOverride = require('method-override');
const { League, Match, Player, Team } = require('../models/index.js')
const ejsMate = require('ejs-mate')


router.get('/', async (req, res) => {
    const echipe = await Team.find({})
    const players = await Player.find({ value: { $gt: 0 } }).sort({ 'value': -1 }).select('_id last first team value photo').populate('team', 'logo name').limit(10);
    res.render('allTeams', { echipe, players });

})

router.get('/new', async (req, res) => {
    const leagues = await League.find({})
    res.render('newTeam', { leagues })
})

router.post('/', async (req, res) => {
    const { name, logo, nameTM, aliasName, url, league } = req.body
    const team = new Team({ name, logo, nameTM, aliasName, url, league })
    await team.save()
    res.redirect(`teams/${team._id}`)
})

router.get('/:teamId', catchAsync(async (req, res) => {

    const liga1 = await League.findOne({ name: 'SuperLiga' });
    const { teamId } = req.params;
    let { sort = 'num' } = req.query;

    switch (sort) {
        case 'num':
            sort = { 'num': 1 };
            break;
        case 'old':
            sort = { 'born.age': -1 };
            break;
        case 'value':
            sort = { 'value': -1 };
            break;
        case 'young':
            sort = { 'born.age': 1 };
            break;
    }

    echipa = await Team.findById(teamId)
        .populate('league')
        .populate({ path: 'squad', options: { sort: sort } })

    res.render('ShowTeam', { echipa });
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    console.log('sal')

    const team = await Team.findById(id)
    for (player of team.squad) {
        await Player.findByIdAndRemove(player._id)
        console.log('plecat')
    }
    await Team.findByIdAndRemove(id)
    res.redirect('/Teams')
}))

router.get('/:teamId/edit', catchAsync(async (req, res) => {

    const { teamId } = req.params;

    const leagues = await League.find({})
    const echipa = await Team.findById(teamId)
        // .populate('league', 'name')
        .populate('squad')

    res.render('editTeam', { echipa, leagues });
}))

router.patch('/:teamId', catchAsync(async (req, res) => {

    const { teamId } = req.params;
    const { name, logo, url, nameTM, aliasName } = req.body

    const leagues = await League.find({})
    let echipa = await Team.findById(teamId)
        // .populate('league', 'name')
        .populate('squad')

    // res.render('editTeam', { echipa, leagues });
    echipa = Object.assign(echipa, { name, logo, url, nameTM, aliasName })
    await echipa.save()
    res.redirect(`/teams/${echipa._id}`)
}))

module.exports = router