const mongoose = require('mongoose');
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const fs = require('fs')

const { addValuePlayers } = require('./update.js')
const { League, Match, Player, Team, Turnament } = require('./models/index.js');
const player = require('./models/player.js');

mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
    .then(() => {
        console.log('Baza e sus, la dispozitia dvs.');
    })
    .catch((err) => {
        console.log(err);
        console.log('Baza e jos, verifica cablajele!');
    })

function photo() {
    axios('https://www.transfermarkt.com/real-madrid/startseite/verein/418')
        .then(async (res) => {
            const html = res.data
            const $ = cheerio.load(html)
            const logo = $('.dataBild img', html).attr('src')
            let cal = $('.table-highlight', html)
            const pos = $(cal).find('td:nth-of-type(1)').text()
            const played = $(cal).find('td:nth-of-type(4)').text()
            const average = $(cal).find('td:nth-of-type(5)').text()
            const pts = $(cal).find('td:nth-of-type(6)').text()
            console.log(pos, played, average, pts)
            for (let elem of $('.responsive-table .items>tbody>tr', html)) {
                const num = parseInt($(elem).find('.rn_nummer').text());
                const nume = $(elem).find('td tbody .hide-for-small a').text().toUpperCase().trim().split(' ')
                let data = $(elem).find('td:nth-of-type(4)').text().replaceAll(',', '').replaceAll('(', '').replaceAll(')', '').split(' ')
                let photo = $(elem).find('.inline-table tbody tr td:nth-of-type(1) a img').attr('data-src').trim().split('/');
                photo[4] = 'header'
                photo = photo.join('/')
                console.log(photo)
                // console.log(pos, played,)
                //await echipa.save()
            }
            //await echipa.save()
        }).catch(err => console.log(err));
}

async function switchFlag() {
    const players = await Player.find({})
    players.forEach(async (player) => {
        if (player.nat.length) {
            player.nat.forEach(async (nat) => {
                const arr = nat.img.split('/')
                arr[5] = 'medium'
                const img = arr.join('/')
                console.log(img)
                nat.img = img

            })
            await player.save()
        }
    })
}
