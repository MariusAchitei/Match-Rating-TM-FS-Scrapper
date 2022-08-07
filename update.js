const mongoose = require('mongoose');
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const fs = require('fs')

const { League, Match, Player, Team } = require('./models/index.js')
const { Console } = require('console');
////const League = require('./models/league.js')

mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
    .then(() => {
        console.log('Baza e sus, la dispozitia dvs.');
    })
    .catch((err) => {
        console.log(err);
        console.log('Baza e jos, verifica cablajele!');
    })

async function updateTable(leagues) {
    //console.log(leagues)
    for (leagueFind of leagues) {
        const league = await League.findOne({ name: leagueFind.name }).populate('teams', 'name tableStats')
        if (!leagueFind.url) {
            return
        }
        league.url = leagueFind.url
        //console.log(league.teams)
        axios(leagueFind.url)
            .then((res) => {
                const html = res.data
                const $ = cheerio.load(html)
                //console.log(league.teams)
                teams = [...league.teams]
                for (let team of teams) {
                    $('.echipa_row', html).each(async function () {
                        const rowName = $(this).find('.echipa a').text();
                        //console.log(rowName)
                        //console.log(team.name)
                        if (rowName === team.name) {
                            const tablePos = $(this).find('.poz').text();
                            const pcts = $(this).find('.puncte').text();
                            const played = $(this).find('.echipa + td').text();
                            const scored = $(this).find('.echipa + td + td + td + td + td').text();
                            const rec = $(this).find('.echipa + td + td + td + td + td').text();
                            team.tableStats.pos = tablePos;
                            team.tableStats.pcts = pcts;
                            team.tableStats.played = played;
                            team.tableStats.scored = scored;
                            team.tableStats.rec = rec;
                            if (team.name == 'FCSB') {
                                console.log(team.tableStats.pos)
                            }
                            await team.save()

                            //console.log('Sall' + played + '---------');
                        }
                    })
                    //console.log(team)
                };
                console.log('gata')
            }).catch(err => console.log(err));
        addMatches(league);
    }
}

async function addMatches(league) {

    axios(league.url)
        .then((res) => {
            const html = res.data
            const $ = cheerio.load(html)
            let i = 0
            //console.log(league.teams)
            $('.section-title + .clasament_general tr', html).each(async function () {
                const date = $(this).find('.etapa-meci-data').text();
                const host = $(this).find('.echipa-etapa-1 a .hiddenMobile').text()
                const visit = $(this).find('.echipa-etapa-2 a .hiddenMobile').text()
                const scoreHost = $(this).find('.scor-goluri').first()
                const scoreVisit = scoreHost.next()

                if (host) {
                    const hostScore = scoreHost.text();
                    const visitScore = scoreVisit.text();
                    const Host = await Team.findOne({ name: host.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') })
                    // .catch((e) => { console.log(e) })
                    const Visit = await Team.findOne({ name: visit.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') })
                    // .catch((e) => { console.log(e) })
                    // console.log("---------")
                    // console.log(Host)
                    // console.log(Visit)
                    // console.log("---------")
                    if (Host) {
                        const match = await new Match({ host: Host._id, visit: Visit._id, date, hostScore, visitScore })
                        await match.save()
                    }
                }




            })
            //console.log(team)
            //console.log('gata')
        }).catch(err => console.log(err));
}

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

//updateTable(leagues)

module.exports = { updateTable };