const express = require('express');
const app = express();
const path = require('path')
const methodOverride = require('method-override');
const { League, Match, Player, Team, Group } = require('../models/index.js')
const ejsMate = require('ejs-mate')
const axios = require('axios')
var bodyParser = require("body-parser");
const { updateTable, addMatches, updateValues } = require('../update')
const { AppError } = require('../utils/appError.js')
const catchAsync = require('../utils/catchAsync')
const { matchSchema, ratingSchema } = require('../schemas')
const { cautMeci, UpdateTableFS, UpdateTurnamentFS } = require('../flashscore.js')
const { createTurnament } = require('../conference.js');
const { group } = require('console');

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

router.get('/', catchAsync(async (req, res) => {
    const leagues = await League.find({})
    res.render('allLeagues', { leagues })
}))

router.post('/', catchAsync(async (req, res) => {

    const league = new League(req.body)
    await league.save()

    res.redirect(`/leagues/${league._id}`)
}))

router.get('/update-all', catchAsync(async (req, res) => {
    const leagues = await League.find({}).select('name urlFS turnament groups')
    for (league of leagues) {
        if (!league.turnament) await UpdateTableFS(league);
        else await UpdateTurnamentFS(league)
    }
    res.render('allLeagues', { leagues })
}))

router.get('/new', async (req, res) => {

    res.render('newLeague')

})

router.get('/update-allMatches', catchAsync(async (req, res) => {
    const leagues = await League.find({}).select('name urlFS')
    for (league of leagues) {
        //await UpdateTableFS(league)
        await cautMeci(league._id, league.urlFS)
    }
    res.render('allLeagues', { leagues })
}))

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const league = await League.findById(id).select('_id name country tier value teams photo turnament groups')
    if (!league.turnament) {
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
        res.render('ShowLeague', { liga1: league, echipe, players });
    }
    else {
        const groups = await Group.find({ turnament: league }).populate('teams.id')

        console.log(groups.length)
        res.render('ShowTurnament', { liga1: league, groups })
    }
    // res.send('sal')

}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const league = await League.findById(id)

    for (let teamId of league.teams) {
        const team = await Team.findById(teamId)

        for (player of team.squad) {
            await Player.findByIdAndRemove(player._id)
            console.log('plecat')
        }
    }

    await League.findByIdAndRemove(id)

    res.redirect('/leagues')


}))

router.get('/:id/update', catchAsync(async (req, res) => {
    const { id } = req.params;
    const league = await League.findById(id)
    //console.log(league, '\n---------------------')

    await updateValues({ name: league.name, url: league.url })

    res.redirect(`/leagues/${id}`)

}))
router.get('/:id/update-table', catchAsync(async (req, res) => {
    const { id } = req.params;
    const league = await League.findById(id).select('name urlFS turnament groups')

    if (!league.turnament) await UpdateTableFS(league);
    else await UpdateTurnamentFS(league)
    res.redirect(`/leagues/${id}`)

}))

router.get('/:id/add-TeamsTM', catchAsync(async (req, res) => {
    const { id } = req.params
    const league = await League.findById(id).select('name urlFS').select('name url')
    await createTurnament(league.name, league.url)
    res.redirect(`/leagues/${id}`)

}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const league = await League.findById(id).populate('teams', 'name');
    // console.log(league)

    res.render('edit-league', { league })
}))

router.get('/:id/matches', async (req, res) => {
    const { id } = req.params;
    res.redirect(`/leagues/${id}/matches/rezultate`)
})

router.get('/:id/matches/rezultate', catchAsync(async (req, res) => {
    const { id } = req.params
    const league = await League.findById(id).select('_id name country tier value teams').select('_id')
    const meciuriLiga1 = await Match.find({ league: league._id, hostScore: { $ne: '-' } })
        .populate('host', 'name logo').populate('visit', 'name logo')
        .sort([["exactDate.year", 1], ["exactDate.month", 1], ["exactDate.day", 1]]);

    res.render('matches', { meciuriLiga1, league })

}))

router.get('/:id/matches/meciuri', catchAsync(async (req, res) => {
    const { id } = req.params
    const league = await League.findById(id).select('_id name country tier value teams').select('_id')
    const meciuriLiga1 = await Match.find({ league: league._id, hostScore: { $eq: '-' }, visitScore: { $eq: '-' } })
        .populate('host', 'name logo').populate('visit', 'name logo')
        .sort([["exactDate.year", -1], ["exactDate.month", -1], ["exactDate.day", -1]]);

    res.render('matches', { meciuriLiga1, league })

}))


router.get('/:id/matches/update', catchAsync(async (req, res) => {
    const { id } = req.params
    const league = await League.findById(id).select('_id name country tier value teams').select('_id urlFS')

    console.log(league._id, league.urlFS)

    await cautMeci(league._id, league.urlFS)


    res.redirect(`/leagues/${id}/matches`)

}))

router.patch('/:id', catchAsync(async (req, res) => {

    const { id } = req.params;
    const { name, country, tier, photo, url, urlFS, turnament } = req.body

    let league = await League.findById(id)

    // res.render('editTeam', { echipa, leagues });
    league = Object.assign(league, { name, country, tier, photo, url, urlFS, turnament })
    await league.save()
    res.redirect(`/leagues/${league._id}`)
}))

// router.post('/:id', catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const team = await Team.findById(id);
//     // team.nameTM = req.body.numeTM.toUpperCase().trim();
//     await team.save()
//     res.redirect(`/SuperLiga/${id}`)

// }))

module.exports = router