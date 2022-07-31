const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const { League, Match, Player, Team } = require('./models/index.js')
const ejsMate = require('ejs-mate')
//const League = require('./models/league.js')

mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
    .then(() => {
        console.log('Baza e sus, la dispozitia dvs.');
    })
    .catch((err) => {
        console.log(err);
        console.log('Baza e jos, verifica cablajele!');
    })


app.use(express.static('public'));
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.get('/SuperLiga', async (req, res) => {
    const liga1 = await League.findOne({ name: 'SuperLiga' });
    console.log(await liga1.populate('teams'));

    res.render('Teams', { liga1 });

})

app.post('/SuperLiga/matches', (req, res) => {
    res.send(req.body);
})

app.get('/SuperLiga/matches/newMatch', async (req, res) => {
    const liga1 = await League.findOne({ name: 'SuperLiga' });
    console.log(await liga1.populate('teams'));
    res.render('newMatch', { liga1 })
})

app.get('/SuperLiga/:teamId', async (req, res) => {
    const liga1 = await League.findOne({ name: 'SuperLiga' });
    const { teamId } = req.params;
    const echipa = await Team.findById(teamId);
    await echipa.populate('league')
    await echipa.populate('squad')
    res.render('ShowTeam', { echipa });
})

app.get('/api/:teamName', async (req, res) => {
    const { teamName } = req.params;
    const team = await Team.findOne({ name: teamName });
    await team.populate('squad');
    res.json(team);

})

app.get('/', (req, res) => {
    res.send('Hai Salut');
})



app.listen(2000, () => {
    console.log('up and running boss')
})