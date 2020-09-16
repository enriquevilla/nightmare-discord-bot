const { Roll, TertiaryRoll } = require('../utils');
const bosses = require('../data/bosses.json');

/**
 * Simulates a Nightmare kill amount with a set party size
 * @param {[string]} args 
 */
// Simulates nightmare kill amount and party size
export const nightmareKill = (args) => {
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
    const partySize = args[0] ? args[0].substr(0,2) !== "--" ? args[0] : 1 : 1; 
    args = args[0] ? args[0].substr(0,2) !== "--" ? args.splice(1) : args : args;
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
        if (Roll(100) <= partySize - 5) {
            if (filter === "--kc") {
                nightmareRolls(nm, drops, kills - i + 1, filter);
            } else {
                nightmareRolls(nm, dropMap, kills - i + 1, filter);
            }
        }
    }
    if (filter === "--kc") {
        return {
            summary: summary, 
            drops: drops,
        };
    } else {
        return {
            summary: summary, 
            drops: dropMap,
        };
    }
}

/**
 * Simulates Nightmare rolls for both armor and orb table
 * @param {Object} nm Object with Nightmare's properties 
 * @param {*} drops Current drops
 * @param {number} kills Amount of kills
 * @param {string} filter Filter for showing kc of unique drops
 */
const nightmareRolls = (nm, drops, kills, filter) => {
    nm.drops.forEach(dropTable => {
        if (Roll(dropTable.rate) === 1 && dropTable.name !== "tertiary") {
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
            const unique = itemRoulette[Roll(totalWeight) - 1];
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
            TertiaryRoll(dropTable, drops, kills, filter);
        }
    });
}

/**
 * Simulates count to armor and orb table drop in same kill
 * @param {[string]} args Discord command arguments
 */
export const doubleDrop = (args) => {
    const partySize = args[0] ? args[0] : 1;
    const extraRoll = (partySize > 5) ? (partySize - 5 > 80) ? 75 : partySize - 5 : 0;
    let kills = 1;
    let armRoll = Roll(120);
    let orbRoll = Roll(600);
    while (armRoll !== 1 || orbRoll !== 1) {
        armRoll = Roll(120);
        orbRoll = Roll(600);
        if (Roll(100) <= extraRoll) {
            if (armRoll === 1 && orbRoll === 1) {
                break;
            } else if (armRoll === 1 && orbRoll !== 1) {
                orbRoll = Roll(600);
            } else if (armRoll !== 1 && orbRoll === 1) {
                armRoll = Roll(120);
            } else {
                armRoll = Roll(120);
                orbRoll = Roll(600);
            }
        }
        kills++;
    }
    return (`It took ${kills} kills with a party size of ${partySize} to get an armor and orb drop in the same kill.`);
}