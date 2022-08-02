const mongoose = require('mongoose');
const axios = require('axios')

const { League, Match, Player, Team } = require('./models/index.js')
//const League = require('./models/league.js')

mongoose.connect('mongodb://127.0.0.1:27017/Ratings', { useNewUrlParser: true })
    .then(() => {
        console.log('Baza e sus, la dispozitia dvs.');
    })
    .catch((err) => {
        console.log(err);
        console.log('Baza e jos, verifica cablajele!');
    })

async function createLeague(numeLiga, taraLiga, tierLiga) {
    const liga = new League({
        name: numeLiga,
        country: taraLiga,
        tier: tierLiga,
        teams: [

        ],
        played: [

        ],
        next: [

        ]
    })
    await liga.save();
}

let i = 0;

async function createTeam(numeEchipa) {
    const echipaNoua = new Team({
        name: numeEchipa,
        logo: '',
        results: [

        ],
        next: [

        ],
        squad: [

        ]
    })
    //Botosani.league = Liga1;

    await echipaNoua.save()
}

async function cautare() {
    const Echipe = await Team.find({ name: 'Steaua' });
    const Steaua = Echipe[0];
    const Ligi = await League.find({ name: 'SuperLiga' });
    const Liga1 = Ligi[0];
    Liga1.teams.push(Steaua);
    //console.log(await Liga1.populate('teams'));
}

async function addToLeague(Echipa, Liga) {
    const Echipe = await Team.find({ name: Echipa });
    const Steaua = Echipe[0];
    //console.log(Steaua)
    const Ligi = await League.find({ name: Liga });
    const Liga1 = Ligi[0];
    Steaua.league = Liga1;
    Liga1.teams.push(Steaua);
    //console.log(await Liga1.populate('teams'));
    //console.log(await Steaua.populate('league'));
    Steaua.save();
    Liga1.save();
}

async function addPhoto(Echipa) {
    const Echipe = await Team.find({ name: Echipa });
    const Steaua = Echipe[0];
    Steaua.logo = `/SuperLiga/logos/${Steaua.nume}`;
    //console.log(Steaua);
    Steaua.save();
}

async function addPlayers(Echipa, link, suf) {
    //console.log(`${link}/${num}`)
    axios.get(link + suf)
        .then(async (res) => {
            const echipa = await Team.findOne({ name: Echipa });
            // console.log(echipa.squad)
            //console.log(echipa.squad);
            //echipa.squad = [];
            //await echipa.save();
            //console.log(echipa.squad);
            // console.log(res.data);
            // console.log(res.data.jucatori[0])
            // console.log(echipa);
            echipa.name = res.data.nume;
            echipa.logo = res.data.logo;
            echipa.tableStats.pos = res.data.tablePos;
            echipa.tableStats.pcts = res.data.pcts;
            echipa.tableStats.played = res.data.played;
            echipa.tableStats.scored = res.data.scored;
            echipa.tableStats.rec = res.data.rec;

            let data = [...res.data.jucatori];

            for (let jucator of data) {
                const player = new Player(jucator)
                player.team = echipa
                await player.save();
                //console.log(player)
                echipa.squad.push(player);
                await echipa.save()
            }
            //console.log(echipa.squad);

            //console.log(echipa.jucatori);

        })
        .catch(async (err) => {
            const echipa = await Team.find({ name: Echipa });
            console.log('---------------')
            console.log(echipa);
            console.log(err);

        })
}

// const echipe = ['Voluntari','Botosani','Arges', 'Sepsi', 'Hermannstadt', 'UCraiova', 'Rapid', 'Uta', 'Cfr', 'Craiova', 'Chindia', 'UCluj', 'Petrolul', 'Mioveni'];

//farul uta

const update = [
    {
        link: 'fcsb/3',
        nume: 'FCSB'
    },
    {
        link: 'fc-farul-constanta/12',
        nume: 'Farul'
    },
    {
        link: 'uta-arad/22',
        nume: 'Uta'
    },
    {
        link: 'fc-voluntari/6',
        nume: 'Voluntari'

    },
    {
        link: 'fc-botosani/8',
        nume: 'Botosani'
    },
    {
        link: 'fc-arges/27',
        nume: 'Arges'
    },
    {
        link: 'sepsi-osk/16',
        nume: 'Sepsi'
    },
    {
        link: 'afc-hermannstadt/19',
        nume: 'Hermannstadt'
    },
    {
        link: 'u-craiova-1948/29',
        nume: 'UCraiova'
    },
    {
        link: 'fc-rapid-1923/30',
        nume: 'Rapid'
    },
    {
        link: 'fc-cfr-1907-cluj/5',
        nume: 'Cfr'
    },
    {
        link: 'universitatea-craiova/9',
        nume: 'Craiova'
    },
    {
        link: 'afc-chindia-targoviste/20',
        nume: 'Chindia'
    },
    {
        link: 'fc-universitatea-cluj/33',
        nume: 'UCluj'
    },
    {
        link: 'fc-petrolul/32',
        nume: 'Petrolul'
    },
    {
        link: 'cs-mioveni/28',
        nume: 'Mioveni'
    }
];


async function reset() {
    await Team.deleteMany({});
    await League.deleteMany({});
    await Player.deleteMany({});
    await Match.deleteMany({});
    await createLeague('SuperLiga', 'Romania', 1);

    update.forEach(async (echipa) => {
        await createTeam(echipa.nume);
        await addToLeague(echipa.nume, 'SuperLiga');
        await addPhoto(echipa.nume);
        //console.log(echipa.nume)
        await addPlayers(echipa.nume, 'http://localhost:8000/getClub/', echipa.link);
        console.log('gata')
    });

}

reset();




// addPlayers('Farul', 'http://localhost:8000/getClub/', 'fc-voluntari/6')
// const echipe = ['Steaua', 'Botosani', 'Farul', 'Arges', 'Sepsi', 'Hermannstadt', 'UCraiova', 'Rapid', 'Uta', 'Voluntari', 'Cfr', 'Craiova', 'Chindia', 'UCluj', 'Petrolul', 'Mioveni'];

// echipe.forEach(async (echipa) => {
//     await createTeam(echipa);
//     await addToLeague(echipa, 'SuperLiga');
//     await addPhoto(echipa);
//     console.log(echipa)
// });







