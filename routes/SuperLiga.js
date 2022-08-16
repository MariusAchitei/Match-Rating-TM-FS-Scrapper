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
const superLigaRoutes = require('../routes/SuperLiga.js')
const router = express.Router()

const validateMatch = (req, res, next) => {
    const { error } = matchSchema.validate(req.body);
    console.log(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        console.log(error.details)
        throw new AppError(msg, 400)
    }
    else {
        next();
    }
}

const validateRating = (req, res, next) => {
    const { error } = ratingSchema.validate(req.body);
    console.log(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        console.log(error.details)
    }
    else {
        next();
    }
}


router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const league = await League.findById(id).select('_id name country tier value teams')
    let { sort = { 'tableStats.pos': 1 } } = req.query;
    switch (sort) {
        case 'pct':
            sort = { 'tableStats.pos': 1 };
            break;
        case 'value':
            sort = { 'value': -1 };
            break;
        case 'GM':
            sort = { 'tableStats.scored': 1 };
            break;
        case 'GP':
            sort = { 'tableStats.rec': 1 };
            break;
    }

    console.log('sal')

    const echipe = await Team.find({ league: league._id }).sort(sort)
    const players = await Player.find({ team: { $in: league.teams }, value: { $gt: 0 } }).sort({ 'value': -1 }).select('_id last first team value photo').populate('team', 'logo name league').limit(10);
    res.render('Teams', { liga1: league, echipe, players });
    // res.send('sal')

}))

router.get('/:id/matches', catchAsync(async (req, res) => {
    const { id } = req.params
    const league = await League.findById(id).select('_id name country tier value teams').select('_id')
    const meciuriLiga1 = await Match.find({ league: league._id }).populate('host', 'name logo').populate('visit', 'name logo').sort('date');

    res.render('matches', { meciuriLiga1 })

}))

router.post('/matches', validateMatch, catchAsync(async (req, res) => {
    const { host_id, visit_id, host_players, visit_players, host_goals, visit_goals, league } = req.body;

    const match = new Match({
        host: host_id,
        visit: visit_id,
        hostGoals: host_goals,
        visitGoals: visit_goals,
        league
    })

    match.hostScore = match.hostGoals.length;
    match.visitScore = match.visitGoals.length

    if (host_players)
        host_players.forEach(player => {
            match.hostSquad.push({
                id: player
            })
        });
    if (visit_players)
        visit_players.forEach(player => {
            match.visitSquad.push({
                id: player
            })
        });


    await match.save()

    res.redirect('/SuperLiga/matches');
}))

router.get('/matches/update', catchAsync(async (req, res) => {
    const leagues =
    {
        name: 'SuperLiga',
        url: 'https://lpf.ro/liga-1'
    }
    await addMatches(leagues);
    res.redirect('/SuperLiga/matches');

}))

router.get('/matches/newMatch', catchAsync(async (req, res) => {
    // const liga1 = await League.findOne({ name: 'SuperLiga' });
    // await liga1.populate('teams')
    const leagues = await League.find({})
    const teams = await Team.find({})
    // console.log(liga1)
    res.render('newMatch', { liga1: teams, leagues })
}))

router.get('/matches/:matchId', catchAsync(async (req, res) => {
    const { matchId } = req.params;
    const meci = await Match.findById(matchId).populate('host visit', 'name logo').populate('hostSquad.id visitSquad.id').populate('hostGoals visitGoals', 'first last')
    res.render('showMatch', { meci })
}))

router.delete('/matches/:matchId', catchAsync(async (req, res) => {
    const { matchId } = req.params;
    const meci = await Match.findByIdAndRemove(matchId)
    res.redirect('/matches')
}))

router.get('/matches/:matchId/:team', catchAsync(async (req, res) => {
    const { matchId, team } = req.params;
    let meci;

    if (team == 'host') {
        meci = await Match.findById(matchId).populate('host visit', 'name logo').populate('hostSquad.id').populate('hostGoals visitGoals', 'first last')
    }
    else {
        meci = await Match.findById(matchId).populate('host visit', 'name logo').populate('visitSquad.id').populate('visitGoals hostGoals', 'first last')
    }
    res.render('showRatings', { meci, team })
}))


router.post('/matches/:matchId', validateRating, catchAsync(async (req, res) => {

    const { meci: meciId, team: team, note: note, potm: potmId } = req.body;
    //if (!meciId || !team || !note || !potmId) throw new AppError('Rating invalid', 400)
    const meci = await Match.findById(meciId)

    //adauga vot omul meciului
    let i = 0;
    let findPotm = {
        id: '',
        voturi: 0,
    }
    let total = 0;

    let players

    if (team == 'host') {
        players = meci.hostSquad;
        console.log('salut')
    }
    else {
        players = meci.visitSquad;
        console.log('pa')
    }

    for (let player of players) {
        if (note[i].id == player.id) {
            player.nota += parseInt(note[i].score);
            player.voturi++;
            i++;
        }
        if (player.id == potmId) {
            player.potm.voturi++;
            total++;
        }
        if (player.potm.voturi > findPotm.voturi) {
            findPotm.id = player.id;
            findPotm.voturi = player.potm.voturi;
        }

    }
    if (team == 'host') {
        meci.hostPotm.id = await Player.findById(findPotm.id);
        meci.hostPotm.curent = findPotm.voturi;
        meci.hostPotm.total += total
    }
    else {
        meci.visitPotm.id = await Player.findById(findPotm.id);
        meci.visitPotm.curent = findPotm.voturi;
        meci.visitPotm.total += total
    }
    await meci.save()

    res.json(meci)

}))

router.post('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const team = await Team.findById(id);
    // team.nameTM = req.body.numeTM.toUpperCase().trim();
    await team.save()
    res.redirect(`/SuperLiga/${id}`)

}))

module.exports = router