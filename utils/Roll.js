/**
 * Rolls a number from 1 to max
 * @param {number} max Maximum number to roll for
 */
export const Roll = (max) => {
    return Math.ceil(Math.random() * Math.floor(max));
}

/**
 * Simulates tertiary table rolls
 * @param {Object} dropTable An object with the tertiary roll items
 * @param {*} drops Current drops
 * @param {number} kills Amount of kills
 * @param {string} filter Filter for showing kc of unique drops
 */
export const TertiaryRoll = (dropTable, drops, kills, filter) => {
    dropTable.items.forEach(item => {
        if (Roll(item.rate) === 1) {
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
