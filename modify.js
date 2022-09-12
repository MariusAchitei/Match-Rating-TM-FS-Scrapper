const mongoose = require('mongoose');
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const fs = require('fs')

const { addValuePlayers } = require('./update.js')
const { League, Match, Player, Team, Turnament } = require('./models/index.js');
const puppeteer = require('puppeteer')

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

async function turnament() {
    const leagues = await League.find({});
    for (league of leagues) {
        league.turnament = 0
        await league.save()
    }
}

async function nameFS() {
    const teams = await Team.find({}).select('nameFS');
    for (team of teams) {
        if (team.nameFS)
            if (team.nameFS[team.nameFS.length - 1] == ')') {
                team.nameFS = team.nameFS.slice(0, -6)
                await team.save()
            }
    }
}

async function cas(link) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({
        width: 1345,
        height: 1001,
        deviceScaleFactor: 1,
    });
    page.goto(link)
    await page.waitForNavigation()
    const events = await page.evaluate(() => {
        const events = { host: [], visit: [], cplm: 0, are: 0 }

        scor = document.querySelector('.detailScore__wrapper').firstChild
        events.hostScore = scor.innerText; events.visitScore = scor.nextElementSibling.nextElementSibling.innerText

        const eventList = document.querySelectorAll(".smv__participantRow")
        events.count = eventList.length

        for (eventEl of eventList) {
            let team, name, type = ''


            if (eventEl.classList.contains('smv__awayParticipant')) { team = 'visit' }
            else { team = 'host'; }

            if (eventEl.querySelector(".substitution")) { name = eventEl.querySelector(".smv__playerName").innerText; type = "sub" }
            else name = eventEl.querySelector(".smv__playerName div") ? eventEl.querySelector(".smv__playerName div").innerText : ''

            if (eventEl.querySelector(".yellowCard-ico")) type = "yellow"
            if (eventEl.querySelector(".redCard-ico")) type = "red"
            if (!type) continue

            events[team].push({
                time: eventEl.querySelector(".smv__timeBox") ? eventEl.querySelector(".smv__timeBox").innerText : '',
                name, type
            })
        }
        return events

    })
    await page.close()
    await browser.close()

    console.log(events)

}

cas("https://www.flashscore.ro/meci/04xUPC2l/#/sumar-meci/sumar-meci")



