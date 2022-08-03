const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const { League, Match, Player, Team } = require('./models/index.js')
const ejsMate = require('ejs-mate')
const axios = require('axios')
var bodyParser = require("body-parser")
//const League = require('./models/league.js')

mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
    .then(() => {
        console.log('Baza e sus, la dispozitia dvs.');
    })
    .catch((err) => {
        console.log(err);
        console.log('Baza e jos, verifica cablajele!');
    })


app.use(bodyParser.json());   // Transforma datele de la axios.post
app.use(express.static('public'));
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/SuperLiga', async (req, res) => {
    const liga1 = await League.findOne({ name: 'SuperLiga' }).populate('teams', 'tablePos name');
    const echipe = await Team.find({ league: liga1._id }).sort('tableStats.pos')
    // console.log(echipe)

    res.render('Teams', { liga1, echipe });

})

app.get('/SuperLiga/matches', async (req, res) => {
    const meciuriLiga1 = await Match.find().populate('host', 'name logo').populate('visit', 'name logo');
    // await meciuriLiga1.populate('host')
    // await meciuriLiga1.populate('visit')

    res.render('matches', { meciuriLiga1 })

})

app.post('/SuperLiga/matches', async (req, res) => {
    // req.body.populate('host_id');
    // req.body.populate('visit_id');
    const match = new Match({
        host: req.body.host_id,
        hostSquad: req.body.host_players,
        visit: req.body.visit_id,
        visitSquad: req.body.visit_players,
        hostGoals: req.body.host_goals,
        visitGoals: req.body.visit_goals
    })
    await match.save()

    //res.send(match)
    res.redirect('/SuperLiga/matches');
})

app.get('/SuperLiga/matches/newMatch', async (req, res) => {
    const liga1 = await League.findOne({ name: 'SuperLiga' });
    //console.log(await liga1.populate('teams'));
    await liga1.populate('teams')
    res.render('newMatch', { liga1 })
})

app.get('/SuperLiga/matches/:matchId', async (req, res) => {
    const { matchId } = req.params;
    const meci = await Match.findById(matchId).populate('visitSquad hostSquad host visit visitGoals hostGoals')
    //console.log(meci.hostGoals)
    //await meci.populate('visitSquad');
    res.render('showMatch', { meci })
})

app.post('/SuperLiga/matches/:matchId', async (req, res) => {


})

app.get('/SuperLiga/:teamId', async (req, res) => {
    const liga1 = await League.findOne({ name: 'SuperLiga' });
    const { teamId } = req.params;
    const echipa = await Team.findById(teamId);
    await echipa.populate('league')
    await echipa.populate('squad')
    res.render('ShowTeam', { echipa });
})

app.get('/api/:teamId', async (req, res) => {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    await team.populate('squad');
    res.json(team);

})

app.get('/', (req, res) => {
    res.send('Hai Salut');
})

app.get('*', (req, res) => {
    res.send('Team prins Astrosmechere')
})



app.listen(2000, () => {
    console.log('up and running boss')
})