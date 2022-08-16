const mongoose = require('mongoose');
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const fs = require('fs')

const { addValuePlayers } = require('./update.js')
const { League, Match, Player, Team, Turnament } = require('./models/index.js');
//const League = require('./models/league.js')

mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
    .then(() => {
        console.log('Baza e sus, la dispozitia dvs.');
    })
    .catch((err) => {
        console.log(err);
        console.log('Baza e jos, verifica cablajele!');
    })


async function createLeague(turnamentName, turnamentUrl) {
    if (await Turnament.findOne({ name: turnamentName })) { return }
    const turnament = new Turnament({
        name: turnamentName,
        url: turnamentUrl
    })
    axios(turnament.url)
        .then((res) => {
            const html = res.data
            const $ = cheerio.load(html)
            let curent = '';
            for (let elem of $('.responsive-table tbody tr', html)) {
                if ($(elem).attr('class') == 'rundenzeile') {
                    // console.log($(elem).find('.zeit.ac').text())
                    if ($(elem).find('.zeit.ac').text().split(' ')[0] !== curent) {
                        curent = $(elem).find('.zeit.ac').text().split(' ')[0]
                        console.log(curent)
                    }
                }

            }

        })
}

async function createMatchTM(host, visit, league,) {
    let match = new Match({
        host,
        visit,
        league,
        etapa: cu
    })

}

async function createLeague(leagueName, LeagueUrl) {
    let league = await League.findOne({ name: leagueName })
    if (!league) {
        league = new League({
            name: leagueName,
            country: 'International',
            teams: [],
            url: LeagueUrl
        })
    }
    if (!league.url) { return }
    await axios(league.url)
        .then(async (res) => {
            const html = res.data
            const $ = cheerio.load(html)
            let curent = '';
            arr = [...$('.responsive-table tbody tr', html)]
            for (let elem of $('.responsive-table tbody tr', html)) {
                // arr.forEach(async (elem) => {
                if ($(elem).attr('class') == 'rundenzeile') {
                    curent = $(elem).find('.zeit.ac').text()
                    continue
                }
                if ($(elem).attr('class') != 'begegnungZeile' || curent.split(' ')[0] != 'Qualifying') { continue }
                numeHost = $(elem).find('td:nth-of-type(3)>.vereinsname>a').text().trim().toUpperCase();
                let urlHost = $(elem).find('td:nth-of-type(3)>.vereinsname>a').attr('href').split('/')
                urlHost[2] = 'startseite'
                urlHost = urlHost.join('/')
                urlHost = 'https://www.transfermarkt.com' + urlHost

                numeVisit = $(elem).find('td:nth-of-type(5)>.vereinsname>a').text().trim().toUpperCase();
                let urlVisit = $(elem).find('td:nth-of-type(5)>.vereinsname>a').attr('href').split('/')
                urlVisit[2] = 'startseite'
                urlVisit = urlVisit.join('/')
                urlVisit = 'https://www.transfermarkt.com' + urlVisit

                let host = await Team.findOne({ $or: [{ 'name': numeHost }, { 'nameTM': numeHost }, { 'url': urlHost }] })
                let visit = await Team.findOne({ $or: [{ 'name': numeVisit }, { 'nameTM': numeVisit }, { 'url': urlVisit }] })

                if (host) {
                    if (!visit) {
                        visit = new Team({
                            name: numeVisit,
                            nameTM: numeVisit,
                            url: urlVisit
                        })
                        await visit.save()
                        await addValuePlayers(urlVisit, visit)
                    }
                }
                if (visit) {
                    if (!host) {
                        host = new Team({
                            name: numeHost,
                            nameTM: numeHost,
                            url: urlHost
                        })
                        await host.save()
                        await addValuePlayers(urlHost, host)
                    }
                }
                if (await Match.findOne({ visit, host, league })) { continue }

                let match = new Match({ host, visit, league, etapa: curent, hostScore: '-', visitScore: '-' })
                await match.save()

            }//)

        })

    // await league.save()
    console.log(league)
}

createLeague('UEFA Europa Conference League Qualifiers', 'https://www.transfermarkt.com/uefa-europa-conference-league-qualifiers/startseite/pokalwettbewerb/ECLQ/saison_id/2022')
