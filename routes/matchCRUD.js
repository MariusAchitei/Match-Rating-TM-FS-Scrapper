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


router.get('/', catchAsync(async (req, res) => {
    const meciuriLiga1 = await Match.find().populate('host', 'name logo').populate('visit', 'name logo')

    res.render('matches', { meciuriLiga1 })

}))

router.post('/', validateMatch, catchAsync(async (req, res) => {
    // const { id } = req.params
    // league = await League.findById(id);
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

    res.redirect(`/leagues/${league}/matches`);
}))

router.get('/update', catchAsync(async (req, res) => {
    const leagues =
    {
        name: 'SuperLiga',
        url: 'https://lpf.ro/liga-1'
    }
    await addMatches(leagues);
    res.redirect('/matches');

}))

router.get('/newMatch', catchAsync(async (req, res) => {
    // const liga1 = await League.findOne({ name: 'SuperLiga' });
    // await liga1.populate('teams')
    const leagues = await League.find({})
    const teams = await Team.find({})
    // console.log(liga1)
    res.render('newMatch', { liga1: teams, leagues })
}))

router.get('/:matchId', catchAsync(async (req, res) => {
    const { matchId } = req.params;
    const meci = await Match.findById(matchId).populate('host visit', 'name logo').populate('hostSquad.id visitSquad.id').populate('hostGoals visitGoals', 'first last')
    res.render('showMatch', { meci })
}))

router.delete('/:matchId', catchAsync(async (req, res) => {
    const { matchId } = req.params;
    const meci = await Match.findByIdAndRemove(matchId)
    res.redirect(`/leagues/${meci.league}/matches`)
}))

router.get('/:matchId/:team', catchAsync(async (req, res) => {
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


router.post('/:matchId', validateRating, catchAsync(async (req, res) => {

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


module.exports = router