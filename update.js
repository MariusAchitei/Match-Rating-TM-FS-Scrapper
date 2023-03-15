const mongoose = require('mongoose');
const axios = require('axios')
const cheerio = require('cheerio')
const cors = require('cors')
const fs = require('fs')

const { League, Match, Player, Team } = require('./models/index.js')
////const League = require('./models/league.js')

// mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
//     .then(() => {
//         console.log('Baza e sus, la dispozitia dvs.');
//     })
//     .catch((err) => {
//         console.log(err);
//         console.log('Baza e jos, verifica cablajele!');
//     })


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
    let nums = players.map(Number);
    for (var i = nums.length; i--;) {
        if (!nums[i])
            nums.splice(i, 1)
    }
    console.log(nums)
    const jucatori = await Player.find({ last: { $in: players }, first: { $in: players }, team: club, num: { $in: nums } }).select('_id')
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
            nums.splice(i, 1)
    }
    const jucatori = await Player.find({ last: { $in: players }, team: club, num: { $in: nums } }).select('_id')
    jucatori.forEach(jucator => {
        match[type].push(jucator._id)
    })
    await match.save()
}
async function addRezerveDB(players, match, type, club) {
    let nums = players.map(Number);
    for (var i = nums.length; i--;) {
        if (!nums[i]) {
            nums.splice(i, 1)
            i--
        }
    }
    const jucatori = await Player.find({ team: club, num: { $in: nums } }).select('_id')
    jucatori.forEach(jucator => {
        match[type].push({
            id: jucator._id
        })
    })
    await match.save()
}

async function addScorers(match) {
    await axios(match.url)
        .then(async (res) => {
            const html = res.data
            const $ = cheerio.load(html)
            for (let elem of $('#tab_evenimente .event_gazda', html)) {
                const name = $(elem).find('img').attr('src')
                if (name == 'assets/images/gol.png') {
                    const arr = $(elem).text().toUpperCase().replaceAll('.', ' ').replaceAll("`", ' ').split(' ')
                    //marcatori.hostGoals = marcatori.hostGoals.concat(arr)
                    let num = 0;
                    for (i = 0; i < arr.length; i++) {
                        if (parseInt(arr[i]))
                            num = parseInt(arr[i])
                        break;
                    }
                    const jucator = await Player.findOne({ last: { $in: arr }, num, team: match.host }).select('_id')
                    if (jucator) {
                        match.hostGoals.push(jucator._id)
                    }
                }
            }
            for (let elem of $('#tab_evenimente .event_oaspeti', html)) {
                const name = $(elem).find('img').attr('src')
                if (name == 'assets/images/gol.png') {
                    const arr = $(elem).text().toUpperCase().replaceAll('.', ' ').replaceAll("`", ' ').split(' ')
                    //marcatori.visitGoals = marcatori.visitGoals.concat(arr)
                    let num = 0;
                    for (i = 0; i < arr.length; i++) {
                        if (parseInt(arr[i]))
                            num = parseInt(arr[i])
                        break;
                    }
                    const jucator = await Player.findOne({ $or: [{ last: { $in: arr }, num }, { num }], team: match.visit }).select('_id')
                    if (jucator) {
                        match.visitGoals.push(jucator._id)
                    }
                }
            }
            await match.save()

        }).catch((e) => console.log(e))


}

async function addMatches(league) {
    const leagueF = await League.findOne({ name: league.name })
    axios(league.url)
        .then(async (res) => {
            //await Match.deleteMany({});
            const html = res.data
            const $ = cheerio.load(html)
            let i = 0
            let etapa = $(html).find('.list-etape .current').text()

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

                    let Visit = await Team.findOne({ name: visit.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') })
                    if (!Visit) {

                        Visit = await Team.findOne({ aliasName: visit.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') })
                    }

                    if (Host && Visit) {
                        if (await Match.findOne({ host: Host._id, visit: Visit._id, date, hostScore, visitScore, etapa })) { return false }
                        let match = await Match.findOne({ host: Host._id, visit: Visit._id, date, etapa })

                        if (!match) { console.log('salllll'); match = new Match({ host: Host._id, visit: Visit._id, date, hostScore, visitScore, url, etapa, league: leagueF }) }
                        else {
                            console.log('ssssssal')
                            match = Object.assign(match, { url, hostScore, visitScore });
                        }

                        if (match.url) {
                            match.url = 'https://lpf.ro/' + match.url

                            const players = await addPlayers(match);
                            await addPlayersDB(players.hostSquad, match, 'hostSquad', match.host);
                            await addPlayersDB(players.visitSquad, match, 'visitSquad', match.visit);

                            await addRezerveDB(players.hostRezerve, match, 'hostSquad', match.host);
                            await addRezerveDB(players.visitRezerve, match, 'visitSquad', match.visit);

                            await addScorers(match)

                        }
                        await match.save()
                    }
                }
            })
        }).catch(err => console.log(err));
    return leagueF._id
}

// async function teamTotalValue(ids) {
//     let value = 0
//     for (id of ids) {
//         const player = await Player.findById(id).select(value);
//         value += player.value
//     }
//     return value
// }

// async function leagueTotalValue(ids) {
//     let value = 0
//     for (id of ids) {
//         const team = await Team.findById(id).select(value);
//         value += team.value
//     }
//     return value
// }

function convertValueToNum(value) {
    if (value[value.length - 1] === 'k') {
        // console.log(value.slice(1, value.length - 1));
        value = parseInt(value.slice(1, value.length - 1))
        return value;
    }
    if (value[value.length - 1] === 'm') {
        value = parseFloat(value.slice(1, value.length - 1)) * 1000;
        return value;
    }
    if (value[value.length - 1] === 'n') {
        value = parseFloat(value.slice(1, value.length - 2)) * 1000 * 1000;
        return value;
    }
    return 0

}

async function playerTransfer(player, echipa, num) {
    await Team.findOneAndUpdate({ _id: player.team }, { $pull: { squad: player._id } });
    await Team.findOneAndUpdate({ _id: echipa._id }, { $push: { squad: player._id } });
    player.team = echipa
    player.num = num ? num : 0
    await player.save()

}

function scrapePlayer(player, $, html) {
    $ = cheerio.load(html)
    let data = $(player).find('td:nth-of-type(4)').text().replaceAll(',', '').replaceAll('(', '').replaceAll(')', '').split(' ');
    // let scrapeData = {
    //     numar: parseInt($(player).find('.tm-shirt-number').text()),
    //     nume: $(player).find('td tbody .hide-for-small a').text().toUpperCase().trim().split(' '),
    //     photo: $(player).find('.inline-table tbody tr td:nth-of-type(1) a img').attr('data-src').trim().split('/'),
    //     born: {
    //         month: data[0],
    //         day: parseInt(data[1]) !== NaN ? parseInt(data[1]) : 0,
    //         year: parseInt(data[2]) !== NaN ? parseInt(data[2]) : 0,
    //         age: parseInt(data[3]) !== NaN ? parseInt(data[3]) : 0
    //     }
    // }
    // let scrapeData = {
    let numar = parseInt($(player).find('.tm-shirt-number').text());
    let nume = $(player).find('td tbody .hide-for-small a').text().toUpperCase().trim().split(' ');
    let photo = $(player).find('.inline-table tbody tr td:nth-of-type(1) a img').attr('data-src').trim().split('/');
    let born = {
        month: data[0],
        day: parseInt(data[1]) !== NaN ? parseInt(data[1]) : 0,
        year: parseInt(data[2]) !== NaN ? parseInt(data[2]) : 0,
        age: parseInt(data[3]) !== NaN ? parseInt(data[3]) : 0
    }
    // }

    photo[4] = 'header'
    photo = photo.join('/')
    if (!photo) photo = "https://lpf.ro/images/jucatori/silueta.png";

    // console.log(numar, nume, photo, born)
    return [numar, nume, photo, born];
}

async function addValuePlayers(echipaUrl, echipa, leagueName) {
    //console.log(echipa)
    if (!echipa.url) {
        echipa.url = echipaUrl
        await echipa.save()
    }
    // let non = 0
    // if (leagueName != 'SuperLiga') non = 1
    let nou = 0
    if (!echipaUrl) return
    axios(echipaUrl)
        .then(async (res) => {
            const html = res.data
            const $ = cheerio.load(html)
            const logo = $('#main > main > header > div.data-header__profile-container > img', html).attr('src')
            console.log(`LOGO: "${echipa.logo}" || "${logo}"`);
            if (!echipa.logo) echipa.logo = logo;

            for (let playerRow of $('.responsive-table .items>tbody>tr', html)) {
                try {
                    let [numar, nume, photo, born] = scrapePlayer(playerRow, $, html);

                    // continue;

                    let jucator
                    if (numar) jucator = await Player.findOne({ last: { $in: nume }, num: numar, team: echipa });
                    else jucator = await Player.findOne({ last: { $in: nume }, team: echipa })


                    //Daca nu am gasit jucatorul facem transfer

                    if (!jucator) {
                        console.log("Nu am gasit jucatorul " + nume);
                        jucator = await Player.findOne({ last: { $in: nume }, 'born.month': born.month, 'born.year': born.year, 'born.age': born.age })
                        if (jucator) {
                            console.log(`L am transferat pe ${nume} la ${echipa.name}`)
                            await playerTransfer(jucator, echipa, numar)
                        }
                        else {
                            console.log("creez noul jucator " + nume);
                            jucator = new Player({
                                last: nume[1] ? nume[1] : nume[0],
                                first: nume[1] ? nume[0] : '',
                                num: numar ? numar : 0,
                                team: echipa,
                                photo: photo
                            })
                            echipa.squad.push(jucator)
                        }
                    }

                    jucator.born = born;

                    if (!jucator.nat.length) {
                        let nat = $(playerRow).find('td:nth-of-type(5) img').first()
                        if (nat.attr('title')) {
                            const arr = nat.attr('src').split('/')
                            arr[5] = 'medium'
                            const img = arr.join('/')
                            jucator.nat.push({
                                country: nat.attr('title'),
                                img
                            })
                        }
                        if (nat.next().next().attr('title')) {
                            const arr = nat.next().next().attr('src').split('/')
                            arr[5] = 'medium'
                            const img = arr.join('/')
                            jucator.nat.push({
                                country: nat.next().next().attr('title'),
                                img
                            })
                        }
                    }

                    if (!jucator.position) {
                        const position = $(playerRow).find('.inline-table tbody tr:nth-of-type(2) td').text()
                        jucator.position = position
                    }


                    let value = $(playerRow).find('.rechts a').text().trim()
                    jucator.value = convertValueToNum(value)
                    console.log("nume: " + nume + " valoare: " + value + "   " + convertValueToNum(value));


                    await jucator.save()
                } catch (err) { console.log(err); continue }
            }
            await echipa.save()
        }).catch(err => console.log(err));
}



async function updateValues(leagueFind, leagueUrl) {
    //console.log(leagueFind, leagueUrl)
    let league = await League.findOne({ name: leagueFind.name }).select('name value _id teams url')

    if (!league) {
        league = new League({
            name: leagueFind.name,
            url: leagueFind.url
        })
        await league.save()
    }
    else { console.log(league, '\n', leagueFind.url.trim()) }


    let leagueValue = 0
    console.log("-------------------------\n -----------------------\n")
    console.log(league.url);
    console.log("-------------------------------\n-----------------------\n")
    axios(league.url)
        .then(async (res) => {
            console.log(league.url)
            const html = res.data
            const $ = cheerio.load(html)

            //selectam toate echipele din tabela de clasament si iteram prin ele

            for (elem of $('.responsive-table tbody tr', html)) {

                // selectam din tabela numele echipei, link ul si valoarea

                let echipaNume = $(elem).find('.hauptlink a').text().toUpperCase().trim()
                arr = echipaNume.split(' ');
                const echipaUrl = $(elem).find('.hauptlink a').attr('href')

                // Cautam echipa in baza de date in functie de numele de pe TM si liga trimisa ca paramentru

                let echipa = await Team.findOne({ nameTM: echipaNume, league }).select('_id name squad')

                //Daca nu gasim echipa in DB o omitem
                //DE FACUT adaugarea echipei in acest caz

                if (!echipa) {
                    console.log('Nu am gasit echipa ' + echipaNume);
                    if (!echipaNume) continue
                    console.log('creez echipa' + echipaNume);
                    echipa = new Team({ nameTM: echipaNume, name: echipaNume, league });
                    league.teams.push(echipa._id)
                    await echipa.save()
                }
                if (!league.teams.includes(echipa._id)) {
                    league.teams.push(echipa._id)
                }


                //Adunam valoare totala a ligii

                // let value = $(elem).find('td:nth-of-type(7)').text()
                // echipa.value = convertValueToNum(value)
                // echipa.updateValue(await teamTotalValue(echipa.squad))
                //leagueValue += convertValueToNum(value);

                //await echipa.save()
                if (echipaUrl) {
                    console.log('fac update la echipa' + echipa.name);
                    await addValuePlayers('https://www.transfermarkt.com' + echipaUrl, echipa, league.name)
                }
            }

            // league.updateValue(await leagueTotalValue(league.teams))

            // if (leagueValue)
            //     league.value = leagueValue;
            // console.log(league.teams)
            await league.save()
        }).catch(err => console.log(err));
    console.log("AM TERMINAT");
}

//addValuePlayers('https://www.transfermarkt.com/dac-dunajska-streda/startseite/verein/4529')

module.exports = { updateTable, addMatches, updateValues, addValuePlayers };