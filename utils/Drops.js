/**
 * Display unique drops and depending on filter, kc of drops
 * @param {*}  
 */
export const Drops = ({summary, drops}) => {
    let dropsString = `${summary}\n`;
    if (drops === -1) {
        return ("Kill amount not specified.");
    } else if (drops === 0) {
        return ("Kills capped at 10000");
    } else if (drops.length > 1) {
        dropsString += "You got:\n";
        drops.forEach(item => {
            dropsString += `${item[0]} at ${item[1]} kills.\n`;
        });
        return (dropsString);
    } else if (Object.keys(drops).length !== 0) {
        for (let key in drops) {
            dropsString += `${key}: ${drops[key]}\n`;
        }
        return (dropsString);
    } else {
        return (dropsString + "You got nothing.");
    }
}
