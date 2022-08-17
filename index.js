const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const { League, Match, Player, Team } = require('./models/index.js')
const { updateTable, addMatches, updateValues, addValuePlayers } = require('./update')

const session = require('express-session')
const flash = require('connect-flash')

const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const axios = require('axios')
var bodyParser = require("body-parser");

const superLigaRoutes = require('./routes/leagueCRUD.js');
const teamRoutes = require('./routes/TeamCRUD.js');
const matchRoutes = require('./routes/matchCRUD.js');
const playerRoutes = require('./routes/playerCRUD.js');
const { AppError } = require('./utils/appError.js');
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

const sessionConfig = {
    secret: 'MagazinulFP',
    resave: false,
    saveUninitialized: true
}

app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
    res.locals.succes = req.flash('succes')
    res.locals.error = req.flash('error')
    next();
})

app.use('/leagues', superLigaRoutes)

app.use('/Teams', teamRoutes)

app.use('/matches', matchRoutes)

app.use('/players', playerRoutes)


app.get('/api/:teamId', catchAsync(async (req, res) => {
    const { teamId } = req.params;
    const team = await Team.findById(teamId);
    await team.populate('squad');
    res.json(team);

}))

app.get('/', (req, res) => {

    res.send('Hai Salut');
})

app.get('/update-matches', catchAsync(async (req, res) => {
    const leagues = [
        {
            name: 'SuperLiga',
            url: 'https://lpf.ro/liga-1'
        },
        {
            name: 'PremierLeague',
            url: ''
        }
    ];
    const league = await addMatches(leagues[0]);
    //await addMatches(leagues);
    res.redirect(`/leagues/${league}/matches`);
}))

app.get('/update-table', catchAsync(async (req, res) => {
    const leagues = [
        {
            name: 'SuperLiga',
            url: 'https://lpf.ro/liga-1'
        },
        {
            name: 'PremierLeague',
            url: ''
        }
    ];
    //await addMatches(leagues[0]);
    await updateTable(leagues);
    res.redirect('/SuperLiga');
}))

app.get('/update-values', catchAsync(async (req, res) => {
    const leagues = [
        {
            name: 'SuperLiga',
            url: 'https://www.transfermarkt.com/liga-1/startseite/wettbewerb/RO1'
        },
        {
            name: 'PremierLeague',
            url: ''
        }
    ];
    //await addMatches(leagues[0]);
    await updateValues(leagues[0]);
    console.log('gata')
    res.redirect('/SuperLiga');
}))

app.get('/add-league', catchAsync(async (req, res) => {
    const leagues = [
        {
            name: 'LIGA PORTUGAL',
            url: 'https://www.transfermarkt.com/liga-nos/startseite/wettbewerb/PO1'
        },
        {
            name: "BUNDESLIGA",
            url: "https://www.transfermarkt.com/bundesliga/startseite/wettbewerb/L1"
        },
        {
            name: 'LIGUE 1',
            url: 'https://www.transfermarkt.com/ligue-1/startseite/wettbewerb/FR1'
        },
        {
            name: 'SERIE A',
            url: 'https://www.transfermarkt.com/serie-a/startseite/wettbewerb/IT1'
        },
        {
            name: 'PremierLeague',
            url: 'https://www.transfermarkt.com/premier-league/startseite/wettbewerb/GB1'
        },
        {
            name: 'LaLiga',
            url: 'https://www.transfermarkt.com/laliga/startseite/wettbewerb/ES1'
        }
    ];
    for (let league of leagues) {
        await updateValues(league);
    }
    console.log('gata')
    res.redirect('/teams');
}))

app.get('/error', (req, res) => {
    throw new AppError('Vai vai', 500)
    //return
    //res.send('sal')
})

// app.use((req, res, next) => {
//     next(new AppError('Nu mai avem', 404))
// })

// app.use((err, req, res, next) => {
//     const { status = 500, message = 'ceva nu i bine' } = err
//     if (!err.message) err.message = 'ceva nu i bine'
//     if (!err.status) err.status = 500
//     //console.log()
//     // res.status(status).render('error', { err })
//     // next()
// })


app.listen(2000, () => {
    console.log('up and running boss')
})