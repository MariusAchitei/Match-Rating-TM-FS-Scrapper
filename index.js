const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const { League, Match, Player, Team } = require('./models/index.js')
const ejsMate = require('ejs-mate')
const axios = require('axios')
var bodyParser = require("body-parser");
const { Console } = require('console');
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
    const { host_id, visit_id, host_players, visit_players, host_goals, visit_goals } = req.body;
    const match = new Match({
        host: host_id,
        //hostSquad: host_players,
        visit: visit_id,
        //visitSquad: visit_players,
        hostGoals: host_goals,
        visitGoals: visit_goals
    })
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
})

app.get('/SuperLiga/matches/newMatch', async (req, res) => {
    const liga1 = await League.findOne({ name: 'SuperLiga' });
    //console.log(await liga1.populate('teams'));
    await liga1.populate('teams')
    res.render('newMatch', { liga1 })
})

app.get('/SuperLiga/matches/:matchId', async (req, res) => {
    const { matchId } = req.params;
    const meci = await Match.findById(matchId).populate('host visit', 'name logo').populate('hostSquad.id visitSquad.id').populate('hostGoals visitGoals', 'first last')
    res.render('showMatch', { meci })
})

app.post('/SuperLiga/matches/:matchId', async (req, res) => {

    const { meci: meciId, note: note, potm: potmId } = req.body;
    const meci = await Match.findById(meciId)

    //adauga vot omul meciului
    let i = 0;
    let findPotm = {
        id: '',
        voturi: 0,
    }
    let total = 0;
    for (let player of meci.hostSquad) {
        if (note[i].id == player.id) {
            player.nota += parseInt(note[i].score);
            //console.log(typeof (note[i].score))
            player.voturi++;
            i++;
            //console.log(player)
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
    meci.potm.id = await Player.findById(findPotm.id);
    meci.potm.curent = findPotm.voturi;
    meci.potm.total += total
    console.log(meci.potm)
    await meci.save()

    res.json(meci)

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