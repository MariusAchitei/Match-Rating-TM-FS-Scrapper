const mongoose = require('mongoose');
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const fs = require('fs')

const { League, Match, Player, Team } = require('./models/index.js')
const { Console } = require('console');
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

async function updateTable(leagues) {
    for (leagueFind of leagues) {
        const league = await League.findOne({ name: leagueFind.name }).populate('teams', 'name tableStats')
        if (!leagueFind.url) {
            return
        }
        league.url = leagueFind.url
        axios(leagueFind.url)
            .then((res) => {
                const html = res.data
                const $ = cheerio.load(html)
                teams = [...league.teams]
                for (let team of teams) {
                    $('.echipa_row', html).each(async function () {
                        const rowName = $(this).find('.echipa a').text();
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
                                // console.log(team.tableStats.pos)
                            }
                            await team.save()

                        }
                    })
                };
                console.log('gata')
            }).catch(err => console.log(err));
    }
}

async function addPlayers(match) {
    let players = {
        hostSquad: [],
        visitSquad: [],
        hostRezerve: [],
        visitRezerve: []
    }
    await axios(match.url)
        .then((res) => {
            const html = res.data
            const $ = cheerio.load(html)
            let i = 0
            $('#tab_loturi .lista_titulari', html).each(function () {
                if (i > 1) { return false }
                const names = $(this).find('.titular-row')
                for (let name of names) {
                    const arr = $(name).text().toUpperCase().split(' ')
                    if (!i) { players.hostSquad = players.hostSquad.concat(arr); }
                    else { players.visitSquad = players.visitSquad.concat(arr); }
                }
                i++;

            })
            $('.event_gazda .jucator-in', html).each(function () {
                let name = $(this).text().trim();
                const arr = name.toUpperCase().split('.')
                players.hostRezerve = players.hostRezerve.concat(arr);
            })
            $('.event_oaspeti .jucator-in', html).each(function () {
                let name = $(this).text().trim();
                const arr = name.toUpperCase().split('.')
                players.visitRezerve = players.visitRezerve.concat(arr);
            })
        }).catch((e) => console.log(e))

    return players

}

async function addPlayersDB(players, match, type, club) {
    const jucatori = await Player.find({ last: { $in: players }, first: { $in: players }, team: club }).select('_id')
    jucatori.forEach(jucator => {
        match[type].push({
            id: jucator._id
        })
    })
    await match.save()
}
async function addScorersDB(players, match, type, club) {
    let nums = players.map(Number);
    for (i = 0; i < nums.length; i++) {
        if (!nums[i])
            nums[i] = 0
    }
    const jucatori = await Player.find({ last: { $in: players }, team: club, num: { $in: nums } }).select('_id')
    jucatori.forEach(jucator => {
        match[type].push(jucator._id)
    })
    await match.save()
}
async function addRezerveDB(players, match, type, club) {
    let nums = players.map(Number);
    for (i = 0; i < nums.length; i++) {
        if (!nums[i])
            nums[i] = 0
    }
    //console.log(players)
    const jucatori = await Player.find({ team: club, num: { $in: nums } }).select('_id')
    jucatori.forEach(jucator => {
        match[type].push({
            id: jucator._id
        })
    })
    await match.save()
}

async function addScorers(match) {
    let marcatori = {
        hostGoals: [],
        visitGoals: []
    }
    await axios(match.url)
        .then((res) => {
            const html = res.data
            const $ = cheerio.load(html)
            $('#tab_evenimente .event_gazda', html).each(function () {
                const name = $(this).find('img').attr('src')
                if (name == 'assets/images/gol.png') {
                    const arr = $(this).text().toUpperCase().replaceAll('.', ' ').replaceAll("`", ' ').split(' ')
                    marcatori.hostGoals = marcatori.hostGoals.concat(arr)
                }
            })
            $('#tab_evenimente .event_oaspeti', html).each(function () {
                const name = $(this).find('img').attr('src')
                if (name == 'assets/images/gol.png') {
                    const arr = $(this).text().toUpperCase().replaceAll('.', ' ').replaceAll("`", ' ').split(' ')
                    marcatori.visitGoals = marcatori.visitGoals.concat(arr)
                }
            })
        }).catch((e) => console.log(e))

    return marcatori;

}

async function addMatches(league) {

    axios(league.url)
        .then(async (res) => {
            //await Match.deleteMany({});
            const html = res.data
            const $ = cheerio.load(html)
            let i = 0
            let etapa = $(html).find('.list-etape .current').text()
            // console.log(etapa)
            $('.section-title + .clasament_general tr', html).each(async function () {
                const date = $(this).find('.etapa-meci-data').text();
                const host = $(this).find('.echipa-etapa-1 a .hiddenMobile').text()
                const visit = $(this).find('.echipa-etapa-2 a .hiddenMobile').text()
                const scoreHost = $(this).find('.scor-goluri').first()
                const scoreVisit = scoreHost.next()
                const url = $(this).find('td + td + td a').attr('href');

                if (host) {
                    const hostScore = scoreHost.text();
                    const visitScore = scoreVisit.text();
                    let Host = await Team.findOne({ name: host.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') })
                    if (!Host) {
                        Host = await Team.findOne({ aliasName: host.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') })
                    }
                    //console.log(Host.name)
                    let Visit = await Team.findOne({ name: visit.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') })
                    if (!Visit) {
                        // console.log(visit.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
                        Visit = await Team.findOne({ aliasName: visit.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') })
                        //console.log(Visit.name)
                    }

                    if (Host && Visit) {
                        if (await Match.findOne({ host: Host._id, visit: Visit._id, date, hostScore, visitScore, etapa })) { return false }
                        // console.log(Host.name)
                        //Match.find({ host: Host._id, visit: Visit._id, date, hostScore, visitScore, url, etapa });
                        const match = new Match({ host: Host._id, visit: Visit._id, date, hostScore, visitScore, url, etapa })
                        // console.log(Host.name + ' vs  ' + Visit.name)
                        if (match.url) {
                            match.url = 'https://lpf.ro/' + match.url
                            const marcatori = await addScorers(match)
                            const players = await addPlayers(match);
                            await addPlayersDB(players.hostSquad, match, 'hostSquad', match.host);
                            await addPlayersDB(players.visitSquad, match, 'visitSquad', match.visit);

                            await addRezerveDB(players.hostRezerve, match, 'hostSquad', match.host);
                            await addRezerveDB(players.visitRezerve, match, 'visitSquad', match.visit);

                            if (marcatori.hostGoals)
                                await addScorersDB(marcatori.hostGoals, match, 'hostGoals', match.host)
                            if (marcatori.visitGoals)
                                await addScorersDB(marcatori.visitGoals, match, 'visitGoals', match.visit)

                        }
                        await match.save()
                    }
                }
            })
        }).catch(err => console.log(err));
}

function convertValueToNum(value) {
    if (value[value.length - 1] === '.') {
        value = parseInt(value.slice(1, value.length - 2))
        return value;
    }
    if (value[value.length - 1] === 'm') {
        value = parseFloat(value.slice(1, value.length - 1)) * 1000;
        return value;
    }
    return 0

}

async function addValuePlayers(echipaUrl, echipa) {
    axios(echipaUrl)
        .then(async (res) => {
            const html = res.data
            const $ = cheerio.load(html)

            // daca echipa nu a fost trimisa, o adaugam in DB

            if (!echipa) {
                const name = $('.dataName h1 span').text();
                const logo = $('.dataHeader .dataBild img').attr('src');
                echipa = new Team({
                    name,
                    logo,
                    squad: [],
                    results: [],
                    next: [],
                })
            }

            // Iteram prin jucatorii echipei

            console.log(echipa.name)

            for (elem of $('.responsive-table .items>tbody>tr', html)) {
                let num = parseInt($(elem).find('td:nth-of-type(1) .rn_nummer').text());
                if (!num) num = 0;
                const nume = $(elem).find('td:nth-of-type(2) tbody span a').text().toUpperCase().trim().split(' ');
                const photo = 'https://lpf.ro/images/jucatori/silueta.png'

                //Cautam jucatorul gasit in baza de date

                let jucator

                if (num) {
                    jucator = await Player.findOne({ last: { $in: nume }, num, team: echipa })
                    if (!jucator) { jucator = await Player.findOne({ num, team: echipa }) }
                }
                else { jucator = await Player.findOne({ last: { $in: nume }, team: echipa }) }

                if (!jucator) { continue }


                // if (!jucator) {
                //     //console.log(nume)
                //     jucator = new Player({
                //         last: nume[2],
                //         first: nume[0],
                //         num,
                //         team: echipa,
                //         photo
                //     })
                //     echipa.squad.push(jucator);
                // }

                //console.log(jucator)

                let data = $(elem).find('td:nth-of-type(4)').text().replaceAll(',', '').replaceAll('(', '').replaceAll(')', '').split(' ')
                if (data) {
                    jucator.born = {
                        month: data[0],
                        day: parseInt(data[1]),
                        year: parseInt(data[2]),
                        age: parseInt(data[3])
                    }
                }

                if (!jucator.nat.length) {
                    let nat = $(elem).find('td:nth-of-type(5) img').first()
                    if (nat.attr('title')) {
                        jucator.nat.push({
                            country: nat.attr('title'),
                            img: nat.attr('src')
                        })
                    }
                    if (nat.next().next().attr('title')) {
                        //console.log(nat.next().next().attr('title') + '    ' + nat.next().next().attr('src'))
                        jucator.nat.push({
                            country: nat.next().next().attr('title'),
                            img: nat.next().next().attr('src')
                        })
                    }
                }

                let value = $(elem).find('td:nth-of-type(6)').text().trim()
                jucator.value = convertValueToNum(value)

                await jucator.save()
            }
            await echipa.save()
        }).catch(err => console.log(err));
}

async function updateValues(leagueFind, leagueUrl) {
    const league = await League.findOne({ name: leagueFind.name }).select('name value _id')

    let leagueValue = 0
    axios(leagueFind.url)
        .then(async (res) => {
            const html = res.data
            const $ = cheerio.load(html)

            //selectam toate echipele din tabela de clasament si iteram prin ele

            for (elem of $('.responsive-table tbody tr', html)) {

                // selectam din tabela numele echipei, link ul si valoarea

                let echipaNume = $(elem).find('.hauptlink a').text().toUpperCase().trim()
                arr = echipaNume.split(' ');
                const echipaUrl = 'https://www.transfermarkt.com' + $(elem).find('.hauptlink a').attr('href')

                // Cautam echipa in baza de date in functie de numele de pe TM si liga trimisa ca paramentru

                const echipa = await Team.findOne({ nameTM: echipaNume, league }).select('_id name')

                //Daca nu gasim echipa in DB o omitem
                //DE FACUT adaugarea echipei in acest caz

                if (!echipa) { continue }

                //Adunam valoare totala a ligii

                let value = $(elem).find('td:nth-of-type(7)').text()
                leagueValue += convertValueToNum(value);

                //await echipa.save()
                await addValuePlayers(echipaUrl, echipa)
            }
            if (leagueValue)
                league.value = leagueValue;
            await league.save()
        }).catch(err => console.log(err));

}

//addValuePlayers('https://www.transfermarkt.com/dac-dunajska-streda/startseite/verein/4529')

module.exports = { updateTable, addMatches, updateValues, addValuePlayers };