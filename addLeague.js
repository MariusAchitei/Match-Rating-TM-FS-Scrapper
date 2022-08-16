const mongoose = require('mongoose');
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const fs = require('fs')

const { League, Match, Player, Team } = require('./models/index.js')
const player = require('./models/player.js');
////const League = require('./models/league.js')

mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
    .then(() => {
        console.log('Baza e sus, la dispozitia dvs.');
    })
    .catch((err) => {
        console.log(err);
        console.log('Baza e jos, verifica cablajele!');
    })