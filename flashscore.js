const mongoose = require('mongoose');
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const fs = require('fs')
const puppeteer = require('puppeteer')
const { addValuePlayers } = require('./update.js')
const { League, Match, Player, Team, Turnament, Group } = require('./models/index.js');
const { convertDateToArrTM, convertDateToArrFS, convertMonthToNum, convertDateToArrFsShort } = require('./utils/convertDate.js')
const { match } = require('assert');
const team = require('./models/team.js');
const league = require('./models/league.js');
const player = require('./models/player.js');
const { innerText } = require('domutils');
const turnament = require('./models/turnament.js');
const { group } = require('console');
//const League = require('./models/league.js')

mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
    .then(() => {
        console.log('Baza e sus, la dispozitia dvs.');
    })
    .catch((err) => {
        console.log(err);
        console.log('Baza e jos, verifica cablajele!');
    })


async function FlashScoreTable(league) {

    try {
        let url = league.urlFS + "/clasament";

        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.setViewport({
            width: 1345,
            height: 1001,
            deviceScaleFactor: 1,
        });
        //console.log(LeagueUrl)
        const turnament = league.turnament
        page.goto(url)
        console.log(url)
        await page.waitForNavigation()
        //try {
        const teams = await page.evaluate((turnament) => {
            // const teams = []
            function scrape(tabel) {
                const teams = []
                for (elem of Array.from(tabel.children)) {
                    tableStats = elem.querySelectorAll("span")
                    echipa = {
                        name: elem.querySelector(".tableCellParticipant__name").innerText.toUpperCase(),
                        pos: parseInt(elem.querySelector(".tableCellRank").innerText.replace('.', '')),
                        played: parseInt(tableStats[0].innerText),
                        won: parseInt(tableStats[1].innerText),
                        tie: parseInt(tableStats[2].innerText),
                        los: parseInt(tableStats[3].innerText),
                        scored: parseInt(tableStats[4].innerText.split(':')[0]),
                        rec: parseInt(tableStats[4].innerText.split(':')[1]),
                        pcts: parseInt(tableStats[5].innerText)
                    }
                    teams.push(echipa)
                }
                return teams
            }
            if (!turnament) {
                tabel = document.querySelector(".ui-table__body");
                scrape(tabel)
                return scrape(tabel)
            }
            else {
                tabele = document.querySelectorAll(".ui-table__body");
                const grupe = []
                for (tabel of tabele) {
                    const grupa = {}
                    grupa.name = tabel.previousSibling.firstChild.nextSibling.innerText;
                    grupa.teams = scrape(tabel)
                    grupe.push(grupa)
                }
                return grupe
            }
        }, turnament)
        //} catch (err) { return FlashScoreTable(league) }

        await page.close()
        await browser.close()

        return teams
    } catch (err) { console.log(err); return FlashScoreTable(league) }
}

async function FlashScoreMatches(LeagueName, LeagueUrl) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setViewport({
        width: 1345,
        height: 1001,
        deviceScaleFactor: 1,
    });
    //console.log(LeagueUrl)
    page.goto(LeagueUrl)
    await page.waitForNavigation()

    // await page.waitForNavigation()
    await page.exposeFunction("convertDateToArrFsShort", convertDateToArrFsShort);
    // await page.screenshot({ path: 'sal.png', fullPage: true })
    const urls = await page.evaluate(() => {
        let etapa = ''
        const divs = Array.from(document.querySelector(".sportName").children)
        const urls = divs.map((elem) => {
            // try {
            if (elem.classList.contains('event__header')) { return 0 };
            if (elem.classList.contains('event__round')) { return { etapa: elem.innerText } };
            if (!elem.id) return
            return `https://www.flashscore.ro/meci/${elem.id.slice(4)}`
            // const match = {
            // host: elem.querySelector(".event__participant--home").innerText.toUpperCase(),
            // visit: elem.querySelector(".event__participant--away").innerText.toUpperCase(),
            // hostScore: elem.querySelector(".event__score--home"),
            // visitScore: elem.querySelector(".event__score--away")
            //     id: elem.id
            // }
            // date = elem.querySelector(".event__time").innerText
            // match.date = convertDateToArrFsShort(date)
            // return match
            // } catch (err) { return }

        })
        return urls;
    })

    await page.close()
    await browser.close()

    return urls

}

async function scrapeMatches(values, finalizat = 1) {
    const browser = await puppeteer.launch()

    // await page.screenshot({ path: 'sal.png', fullPage: true })
    console.log(values)
    // console.log(finalizat)
    let matches = []
    let etapa = ''

    for (value of values) {
        if (!value) continue
        if (typeof (value) == 'object') { etapa = value.etapa; continue }

        let url = value
        if (finalizat) { url = url + '/#/sumar-meci/echipele-de-start' }
        console.log('//-------------', finalizat, '-------------||')
        console.log(url)
        const skip = await Match.findOne({ url: value })
            .select('host visit visitScore hostScore').populate("visit", 'name').populate('host', 'name');
        if (skip) {
            console.log(skip.visitScore, skip.hostScore); console.log(finalizat, skip.status);
            if ((finalizat && skip.status) || (!finalizat && !skip.staus)) {
                console.log('am gasit meciul', skip.host.name, skip.visit.name); continue
            }
        }

        try {
            const page = await browser.newPage()
            await page.setViewport({
                width: 1345,
                height: 1001,
                deviceScaleFactor: 1,
            });
            page.goto(url)

            await page.waitForNavigation()
            await page.exposeFunction("convertDateToArrFS", convertDateToArrFS);

            const match = await page.evaluate(async (finalizat) => {

                const match = { visitSquad: [], hostSquad: [], date: {} }
                match.league = document.querySelector("#detail > div.tournamentHeader.tournamentHeaderDescription > div > span.tournamentHeader__country").innerText
                date = document.querySelector("#detail > div.duelParticipant > div.duelParticipant__startTime > div").innerText
                match.date = await convertDateToArrFS(date)
                match.host = document.querySelector("#detail > div.duelParticipant > div.duelParticipant__home > div.participant__participantNameWrapper > div.participant__participantName.participant__overflow > a").innerText.toUpperCase() //.slice(0, -6)
                if (match.host[match.host.length - 1] == ')') match.host = match.host.slice(0, -6)
                match.visit = document.querySelector("#detail > div.duelParticipant > div.duelParticipant__away > div.participant__participantNameWrapper > div.participant__participantName.participant__overflow > a").innerText.toUpperCase() //.slice(0, -6)
                if (match.visit[match.visit.length - 1] == ')') match.visit = match.visit.slice(0, -6)

                let scor

                if (finalizat) {
                    scor = document.querySelector('.detailScore__wrapper').firstChild
                    match.hostScore = scor.innerText; match.visitScore = scor.nextElementSibling.nextElementSibling.innerText
                } else { match.hostScore = '-'; match.visitScore = '-'; return match }

                const tabele = document.querySelectorAll('.lf__side')

                for (i = 0; i < 4; i++) {
                    let type
                    if (i % 2 == 0) type = 'hostSquad'
                    else type = 'visitSquad'
                    players = tabele[i].children
                    for (player of players) {
                        let status = i < 2 ? 1 : 0, card = 0 //, goals = 0
                        const goals = player.querySelectorAll(".soccer").length
                        const substitution = player.querySelector(".substitution")
                        const yellow = player.querySelector(".yellowCard-ico"); yellow ? card = 1 : '';
                        const red = player.querySelector(".redCard-ico"); red ? card = 2 : ''

                        if (substitution) {
                            if (i < 2) status = 2
                            else status = 3
                        }
                        match[type].push({
                            num: parseInt(player.firstChild.innerText),
                            name: player.querySelector('.lf__participantName div').innerText.toUpperCase(),
                            status,
                            card,
                            goals
                        })
                    }

                }
                return match
            }, finalizat)

            if (finalizat) {
                await page.goto(value + '/#/sumar-meci/sumar-meci')
                console.log(value + '/#/sumar-meci/sumar-meci')
                await page.waitForSelector('.smv__participantRow')
                // await page.waitForNavigation()
                // await page.screenshot({ path: 'sal.png', fullPage: true })
                // await page.exposeFunction("convertDateToArrFS", convertDateToArrFS);

                match.events = await page.evaluate(() => {
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
            }

            match.etapa = etapa
            match.url = url
            matches.push(match)

            await page.close()
        } catch (err) { console.log('navigare esuata \n', err) }
    }

    await browser.close()

    //console.log('matches', matches)
    return matches

}


async function createMatchFS(match, league, visit, host) {
    const searchDate = {
        day: match.date.day,
        month: match.date.month,
        year: match.date.year,
    }
    const newMatch = new Match(
        {
            visit, host,
            league,
            hostScore: match.hostScore,
            visitScore: match.visitScore,
            exactDate: searchDate,
            etapa: match.etapa,
            url: match.url
        })
    await newMatch.save()
    return newMatch
}

async function checkPlayers(players) {
    if (!players) return null
    teams = []

    for (playerDat of players) {
        ok = 0
        const player = await Player.findOne({ last: { $in: playerDat.name.split(' ') }, num: playerDat.num })
        if (!player) { console.log("n am gasit echipa pt ", playerDat); continue }
        if (teams.length)
            for (let team of teams) {
                if (toString(team.id) == toString(player.team)) {
                    ok = 1
                    // console.log('HIT')
                    team.num++;
                    if (team.num >= 10) {
                        return team.id
                    }
                }
                //else console.log(team.id, player.team, team.id == player.team._id)
            }
        if (!ok) { console.log('PUSHH'); teams.push({ id: player.team, num: 1 }) }
    }
    console.log(teams)

    return null
}

async function addMatchesDB(matches, league) {
    console.log(matches)
    console.log('-----------------')
    for (let match of matches) {
        const searchDate = {
            day: match.date.day,
            month: match.date.month,
            year: match.date.year,
        }
        let visit = await Team.findOne({ $or: [{ name: match.visit }, { nameTM: match.visit }, { aliasName: match.visit }, { nameFS: match.visit }] })
        let host = await Team.findOne({ $or: [{ name: match.host }, { nameTM: match.host }, { aliasName: match.host }, { nameFS: match.host }] })
        // for (team of [host, visit]) {
        if (!team) {
            const hostId = await checkPlayers(match.hostSquad)
            console.log('-----------', hostId, '---------')
            if (hostId) {
                host = await Team.findById(hostId)
                if (host) {
                    console.log('l am pierdut da l am gasit')
                    host.nameFS = match.host
                    console.log(match.host.nameFS)
                    await host.save()
                }
            }
            else console.log('n am dat de el sefu')
        }
        // }
        if (!visit) {
            const visitId = await checkPlayers(match.visitSquad)
            console.log('-----------', visitId, '---------')
            if (visitId) {
                visit = await Team.findById(visitId)
                if (visit) {
                    console.log('l am pierdut da l am gasit')
                    visit.nameFS = match.visit
                    await visit.save()
                }
            }
            else console.log('n am dat de el sefu')
        }
        let matchDB = await Match.findOne({ $or: [{ visit, host, league }, { visit, 'exactDate.day': searchDate.day, 'exactDate.month': searchDate.month }, { host, 'exactDate.day': searchDate.day, 'exactDate.month': searchDate.month }] }).populate('visit', '_id name url nameFS').populate('host', '_id name url nameFS')
        if (!matchDB) {
            console.log('N am gasit', match.host, match.visit);
            if (visit && host)
                matchDB = await createMatchFS(match, league, visit, host)
            else { console.log('Nici n-am facut, baga tu echipele astea'); continue }
        }
        else {
            if (!matchDB.url) {
                matchDB.url = match.url;
                // await matchDB.save()
            }
            console.log('$$$$$$$$$$$', matchDB.host.name, matchDB.visit.name)
            if (matchDB.visitScore != match.visitScore && matchDB.hostScore != match.hostScore) {
                matchDB.visitScore = match.visitScore; matchDB.hostScore = match.hostScore;
            }
        }
        // console.log(matchDB)
        if (!host) {
            //console.log(matchDB.host._id)
            host = await Team.findById(matchDB.host._id)
            console.log('--------------', matchDB.host._id)
            host.nameFS = match.host
            console.log(match.host.nameFS)
            await host.save()
        }
        if (!visit) {
            visit = await Team.findById(matchDB.visit._id)
            console.log('-----------', matchDB.visit._id)
            visit.nameFS = match.visit
            console.log(match.visit.nameFS)
            await visit.save()
        }
        if (!matchDB.visitSquad.length || !match.visitSquad.length) {
            console.log(matchDB.visit.name, matchDB.host.name)
            for (playerDat of match.hostSquad) {
                let player = await Player.findOne({ $or: [{ last: { $in: playerDat.name.split(' ') }, num: playerDat.num, team: host._id }, { num: playerDat.num, team: host._id }] })
                if (!player) { console.log('n am dat de', playerDat.name, playerDat.num); continue }
                matchDB.hostSquad.push({ id: player._id })
            }
            for (playerDat of match.visitSquad) {
                const player = await Player.findOne({ $or: [{ last: { $in: playerDat.name.split(' ') }, num: playerDat.num, team: visit._id }, { num: playerDat.num, team: visit._id }] })
                if (!player) { console.log('n am dat de', playerDat.name, playerDat.num); continue }
                matchDB.visitSquad.push({ id: player._id })
            }

        }
        await matchDB.save()

    }
}

async function cautMeci(leagueId, leagueUrlFS) {
    const league = await League.findById(leagueId)
    const scrapeRezultate = await FlashScoreMatches(league.name, leagueUrlFS + '/rezultate')
    const scrapeMeciuri = await FlashScoreMatches(league.name, leagueUrlFS + '/meciuri')

    let curent = ''
    let values

    // console.log(scrapeRezultate)
    // console.log(scrapeMeciuri)

    const rezultate = await scrapeMatches(scrapeRezultate)
    const meciuri = await scrapeMatches(scrapeMeciuri, finalizat = 0)

    // console.log(rezultate)
    await addMatchesDB(meciuri, league)
    await addMatchesDB(rezultate, league)
}

async function UpdateTableFS(league) {
    const teams = await FlashScoreTable(league)
    // console.log(teams)
    for (let team of teams) {
        teamDB = await Team.findOne({ $or: [{ name: team.name }, { nameFS: team.name }] }).select('name tableStats')

        if (teamDB) console.log(teamDB.name)
        else { console.log('n am gasit'); continue }

        teamDB.tableStats = {
            pos: team.pos,
            played: team.played,
            pcts: team.pcts,
            rec: team.rec,
            scored: team.scored,
        }

        console.log(teamDB.tableStats)
        await teamDB.save();
    }
}

async function UpdateTurnamentFS(turnament) {
    if (!turnament.turnament) return
    let groups = []
    while (!groups.length) groups = await FlashScoreTable(turnament)
    console.log(groups)
    for (let group of groups) {
        let groupDB = await Group.findOne({ turnament, name: group.name })
        if (!groupDB) { groupDB = new Group({ turnament, name: group.name }) }
        for (let team of group.teams) {
            teamDB = await Team.findOne({ $or: [{ name: team.name }, { nameFS: team.name }] }).select('name tableStats')

            if (teamDB) console.log(teamDB.name)
            else { console.log('n am gasit'); continue }


            function checkTeamInGroup(groupDB, teamDB) {
                console.log(groupDB.teams)
                for (i = 0; i < groupDB.teams.length; i++) {
                    if (teamDB.equals(groupDB.teams[i].id)) {
                        //console.log(i)
                        return i
                    }
                }
                //console.log(groupDB.teams.length)
                return -1
            }
            console.log('am ajuns la ', checkTeamInGroup(groupDB, teamDB))
            const tableStats = {
                pos: parseInt(team.pos),
                played: parseInt(team.played),
                pcts: parseInt(team.pcts),
                rec: parseInt(team.rec),
                scored: parseInt(team.scored),
            }

            const index = checkTeamInGroup(groupDB, teamDB)
            if (index < 0) {
                groupDB.teams.push({
                    id: teamDB._id,
                    tableStats
                })
            } else {
                groupDB.teams[index].tableStats = tableStats
            }

        }
        groupDB.teams.sort((a, b) => { return b.tableStats.pcts - a.tableStats.pcts })
        turnament.groups.push(groupDB)
        await groupDB.save()

    }
    await turnament.save()
}

async function CPLM(link) {
    const bombeu = await scrapeMatches([link], 1)
    if (bombeu.length) {
        console.log(bombeu[0])
    }
}

const link = "https://www.flashscore.ro/meci/04xUPC2l"
CPLM(link)


// module.exports = { cautMeci, UpdateTableFS, UpdateTurnamentFS }
