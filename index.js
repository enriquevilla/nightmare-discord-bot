const Discord = require('discord.js');
const client = new Discord.Client();
const bosses = require('./bosses.json');
const {GUILD_ID, TOKEN} = require('./config');
let emojis;

// Calculate a roll from 1 until param max
function calcRoll(max) {
    return Math.ceil(Math.random() * Math.floor(max));
}

// Get server emojis
const getEmojis = async (id) => {
    let response = await client.guilds.fetch(id)
        .then(guild => {
            return guild.emojis.cache
        })
        .catch(console.error);
    return response;
}

// Display bosses
const getBosses = (channel) => {
    let bossList = "";
    // build boss list
    let boss = bosses.find(boss => boss.name === "The Nightmare");
    // get emoji and build string
    let emoji = emojis.find(item => {
        return item.name === boss.emoji;
    });
    bossList += `${boss.name} ${emoji}`;
    bossList += "\n\t";
    bossList += "Uses: "
    for (let cmd of boss.cmds) {
        bossList += cmd;
        bossList += ", ";
    }
    bossList = bossList.slice(0, bossList.length - 2);
    bossList += "\n\t";
    bossList += "Example: ";
    bossList += boss.structure;
    bossList += "\n"
    channel.send(bossList);
}

// Display unique drops and kc
const displayDrops = ([summary, drops], channel) => {
    dropsString = `${summary}\n`;
    if (drops === -1) {
        channel.send("Kill amount not specified.");
    } else if (drops === 0) {
        channel.send("Kills capped at 10000")
    } else if (drops.length > 1) {
        dropsString += "You got:\n";
        drops.forEach(item => {
            dropsString += `${item[0]} at ${item[1]} kills.\n`;
        });
        channel.send(dropsString);
    } else if (Object.keys(drops).length !== 0) {
        for (let key in drops) {
            dropsString += `${key}: ${drops[key]}\n`;
        }
        channel.send(dropsString);
    } else {
        channel.send(dropsString + "You got nothing.");
    }
}

// Simulates tertiary drop rolls
const tertiaryRoll = (dropTable, drops, kills, filter) => {
    dropTable.items.forEach(item => {
        if (calcRoll(item.rate) === 1) {
            if (filter === "--kc") {
                drops.push([item.name, kills]);
            } else if (!drops[item.name]) {
                drops[item.name] = 1;
            } else {
                drops[item.name]++;
            }
        }
    });
}

// Simulates nightmare rolls (armor and orb)
const nightmareRolls = (nm, drops, kills, filter) => {
    nm.drops.forEach(dropTable => {
        if (calcRoll(dropTable.rate) === 1 && dropTable.name !== "tertiary") {
            // Inserts item x amount of times into a roulette
            let itemRoulette = [];
            let totalWeight = 0
            dropTable.items.forEach(item => {
                for (let i = item.weight; i > 0; i--) {
                    itemRoulette.push([item.name, kills]);
                }
                totalWeight += item.weight;
            });
            // Determines unique drop from roulette
            const unique = itemRoulette[calcRoll(totalWeight - 1)];
            if (filter === "--kc") {
                drops.push(unique);
            } else if (!drops[unique[0]]) {
                drops[unique[0]] = 1;
            } else {
                drops[unique[0]]++;
            }
        }
        // Tertiary drop table
        if (dropTable.name === "tertiary") {
            tertiaryRoll(dropTable, drops, kills);
        }
    });
}

// Simulates nightmare kill amount and party size
const nightmareKill = (args) => {
    // get nm object
    const nm = bosses.find(i => {
        return i.name = "The Nightmare";
    });
    let emoji = emojis.find(item => {
        return item.name === nm.emoji;
    });
    // get args
    const kills = args[0];
    if (!kills) {
        return ["", -1];
    }
    if (kills > 10000) {
        return ["", 0]
    }
    args = args.splice(1);
    // if party size is set
    const partySize = args[0].substr(0,2) !== "--" ? args[0] : 1; 
    args = args[0].substr(0,2) !== "--" ? args.splice(1) : args;
    const filter = args[0] ? args[0] : "";
    args = args.splice(1);
    let drops = [];
    let dropMap = {};
    const extraRoll = (partySize > 5) ? (partySize - 5 > 80) ? 75 : partySize - 5 : 0;
    const summary = `${nm.name} ${emoji} ${kills} kills with a party size of ${partySize} (${extraRoll}%)`;
    for (let i = kills; i > 0; i--) {
        if (filter === "--kc") {
            nightmareRolls(nm, drops, kills - i + 1, filter);
        } else {
            nightmareRolls(nm, dropMap, kills - i + 1, filter);
        }
        if (calcRoll(100) <= partySize - 5) {
            if (filter === "--kc") {
                nightmareRolls(nm, drops, kills - i + 1, filter);
            } else {
                nightmareRolls(nm, dropMap, kills - i + 1, filter);
            }
        }
    }
    if (filter === "--kc") {
        return [summary, drops];
    } else {
        return [summary, dropMap];
    }
}

// Simulates count to armor and orb table drop in same kill
const doubleDrop = (args, channel) => {
    const partySize = args[0] ? args[0] : 1;
    const extraRoll = (partySize > 5) ? (partySize - 5 > 80) ? 75 : partySize - 5 : 0;
    let kills = 1;
    let armRoll = calcRoll(120);
    let orbRoll = calcRoll(600);
    while (armRoll !== 1 || orbRoll !== 1) {
        armRoll = calcRoll(120);
        orbRoll = calcRoll(600);
        if (calcRoll(100) <= partySize - 5) {
            if (armRoll === 1 && orbRoll === 1) {
                break;
            } else if (armRoll === 1 && orbRoll !== 1) {
                orbRoll = calcRoll(600);
            } else if (armRoll !== 1 && orbRoll === 1) {
                armRoll = calcRoll(120);
            } else {
                armRoll = calcRoll(120);
                orbRoll = calcRoll(600);
            }
        }
        kills++;
    }
    channel.send(`It took ${kills} kills with a party size of ${partySize} to get an armor and orb drop in the same kill.`);
}

client.on('ready', () => {
    getEmojis(GUILD_ID).then(response => {emojis = response});
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (msg.content.substring(0, 1) == '!') {
        let args = msg.content.substring(1).split(' ');
        let cmd = args[0];
        cmd = cmd.toLowerCase();
        args = args.splice(1);
        args = args.map(i => {
            return i.toLowerCase();
        });
        if (cmd) {

            // !bosses
            if (cmd === 'help') {
                getBosses(msg.channel);
            }

            // !k !kill
            if (cmd === 'k' || cmd === 'kill') {
                if (args[0] === 'nm' || args[0] === 'nightmare') {
                    args = args.splice(1);
                    displayDrops(nightmareKill(args), msg.channel);
                }
                if (args[0] === 'nmdoubledrop') {
                    args = args.splice(1);
                    doubleDrop(args, msg.channel);
                }
            }
        }
    }
});

client.login(TOKEN);