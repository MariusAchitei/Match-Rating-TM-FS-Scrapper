const mongoose = require('mongoose');
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const fs = require('fs')
const { convertDateToArrTM, convertMonthToNum } = require('./utils/convertDate.js')

const { addValuePlayers } = require('./update.js')
const { League, Match, Player, Team, Turnament } = require('./models/index.js');
const { cautMeci } = require('./flashscore.js')
//const League = require('./models/league.js')

// mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
//     .then(() => {
//         console.log('Baza e sus, la dispozitia dvs.');
//     })
//     .catch((err) => {
//         console.log(err);
//         console.log('Baza e jos, verifica cablajele!');
//     })

async function addMatchTM(meci) {

    let arr = meci.url.split('/')
    arr[4] = 'aufstellung'
    lineUpUrl = arr.join('/')

    await axios(lineUpUrl)
        .then(async (res) => {
            const html = res.data
            const $ = cheerio.load(html)
            console.log('am facut request u')
            let i = 1
            for (elem of $('.large-6.columns', html)) {
                console.log(i)
                if (i > 4) { break }
                let echipa
                let type
                if (i % 2 == 1) { echipa = meci.host; type = 'hostSquad' }
                else { echipa = meci.visit; type = 'visitSquad' }
                for (el of $(elem).find('.box>.responsive-table>.items>tbody>tr')) {
                    const num = parseInt($(el).find('.rn_nummer').text());
                    const nume = $(el).find('td .inline-table tbody .wichtig').text().toUpperCase().trim().split(' ');
                    console.log(num, nume)
                    let jucator

                    if (num) {
                        jucator = await Player.findOne({ last: { $in: nume }, num, team: echipa }).select('_id')
                        if (!jucator) { jucator = await Player.findOne({ num, team: echipa }).select('_id') }
                    }
                    else jucator = await Player.findOne({ last: { $in: nume }, team: echipa }).select('_id')
                    if (!jucator) continue

                    console.log('adaug jucator')
                    meci[type].push({ id: jucator._id })
                }
                i++
            }
        }).catch(err => {
            console.log(err.code, '\n', meci.visit.name, meci.host.name, '\n', lineUpUrl, '\n', meci.url);
        });
    await meci.save()
}

async function createTurnament(leagueName, LeagueUrl) {
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
            let curData = '';
            arr = [...$('.responsive-table tbody tr', html)]

            // iterez prin tabelul cu meciuri

            for (let elem of $('.responsive-table tbody tr', html)) {

                // Daca randul tabelului are clasa rundenzeile inseamna ca este numele etapei
                // memoram etapa si iteram mai departe

                if ($(elem).attr('class') == 'rundenzeile') {
                    curent = $(elem).find('.zeit.ac').text()
                    continue
                }

                // verificam daca este linie de meci 
                // am adaugat conditia de a fi meci de play-off  curent.split(' ')[0] != 'Qualifying'

                if ($(elem).attr('class') != 'begegnungZeile') { console.log('paa'); continue }
                // if (curent.split(' ')[0] != 'Qualifying') { console.log('am iesit'); break }

                data = $(elem).children().first()
                if (data.text().trim()) {
                    curData = $(data).find('a').text().trim()
                    console.log($(data).find('a').text().trim(), $(data).find('a').text().trim().length)
                }

                // Colectam datele gazdei

                numeHost = $(elem).find('td:nth-of-type(3)>.vereinsname>a').text().trim().toUpperCase();
                let urlHost = $(elem).find('td:nth-of-type(3)>.vereinsname>a').attr('href').split('/')
                urlHost[2] = 'startseite'
                urlHost = urlHost.join('/')
                urlHost = 'https://www.transfermarkt.com' + urlHost

                // Colectam datele vizitatorilor

                numeVisit = $(elem).find('td:nth-of-type(5)>.vereinsname>a').text().trim().toUpperCase();
                let urlVisit = $(elem).find('td:nth-of-type(5)>.vereinsname>a').attr('href').split('/')
                urlVisit[2] = 'startseite'
                urlVisit = urlVisit.join('/')
                urlVisit = 'https://www.transfermarkt.com' + urlVisit

                // cautam echipele gasaite in baza de date

                let host = await Team.findOne({ $or: [{ 'name': numeHost }, { 'nameTM': numeHost }, { 'url': urlHost }] })
                let visit = await Team.findOne({ $or: [{ 'name': numeVisit }, { 'nameTM': numeVisit }, { 'url': urlVisit }] })

                // Pentru a nu incarca DB am ales sa adaug meciurile in care apar echipe din DB
                // Adica adaug doar echipe Romanesti si adaug in db adversarele lor
                // if (!host && !visit) continue


                if (!visit) {
                    visit = new Team({
                        name: numeVisit,
                        nameTM: numeVisit,
                        url: urlVisit
                    })
                    await visit.save()
                    await addValuePlayers(urlVisit, visit)
                }

                if (!host) {
                    host = new Team({
                        name: numeHost,
                        nameTM: numeHost,
                        url: urlHost
                    })
                    await host.save()
                    await addValuePlayers(urlHost, host)
                }

                // daca meciul a fost deja inregistrat trecem la urmatoarea iteratie

                const centru = $(elem).find('span.ergebnis>a>span')
                const url = $(elem).find('span.ergebnis>a').attr('href')
                let hostScore = '', visitScore = '', addData = curData

                if ($(centru).attr('class') == 'matchresult finished') {
                    const arr = $(centru).text().split(':')
                    hostScore = arr[0]; visitScore = arr[1];
                    console.log(hostScore, visitScore)

                } else {
                    arr = $(centru).text().split(':')
                    arr[0] = 1 + parseInt(arr[0])
                    ora = arr.join(':')
                    addData = addData + ' ' + ora

                }

                const meci = await Match.findOne({ visit, host, league }).populate('host', 'name').populate('visit', 'name')
                if (meci) {
                    let k = 0;
                    let update = 0
                    // if (!meci.date) { k = 1; meci.date = addData; }
                    k = 1; meci.date = addData; meci.exactDate = convertDateToArrTM(addData); console.log(addData, 'salut', meci.exactDate)
                    if (!meci.url || meci.url != 'https://www.transfermarkt.com' + url) { k = 1; meci.url = 'https://www.transfermarkt.com' + url; console.log(url) }
                    if (!meci.status && visitScore && hostScore) { update = 1; k = 1; meci.visitScore = visitScore; meci.hostScore = hostScore }
                    if (k == 1) { await meci.save() }
                    if (update || (meci.visitScore && meci.hostScore && !meci.hostSquad.length && !meci.visitSquad.length)) { console.log('adaug meci'); await addMatchTM(meci) }
                    continue
                }


                let match

                if (visitScore && hostScore) {
                    let match = new Match({ host, visit, league, etapa: curent, date: curData, exactDate: convertDateToArrTM(addData), url: 'https://www.transfermarkt.com' + url, hostScore, visitScore })
                    await match.save()
                    await addMatchTM(match)
                }
                else {
                    let match = new Match({ host, visit, league, etapa: curent, date: curData, exactDate: convertDateToArrTM(addData), url: 'https://www.transfermarkt.com' + url });
                    await match.save()
                }



            }//)

        }).catch(err => console.log(err));

    // await league.save()
    console.log(league)
}

async function addMatch(id) {
    const meci = await Match.findById(id)
    if (meci)
        await addMatchTM(meci)
    else
        return

}

module.exports = { createTurnament }

// addMatch("62fe4a806bcdbbbcd01090de")
// createLeague('Champions League', 'https://www.transfermarkt.com/uefa-champions-league/startseite/pokalwettbewerb/CL')
// cautMeci('UEFA Europa Conference League Qualifiers', 'https://www.flashscore.ro/fotbal/europa/europa-conference-league/rezultate/')

// console.log(convertDateToArr('Aug 25, 2022 8:00 PM'))