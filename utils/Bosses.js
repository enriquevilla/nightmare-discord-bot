/**
 * Returns the boss list
 */
export const Bosses = () => {
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
    return bossList;
}
