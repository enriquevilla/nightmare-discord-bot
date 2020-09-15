/**
 * Method that returns a Guild's Emojis
 * @param {number} id The Guild ID to get Emojis from 
 */
export const Emojis = async (client, id) => {
    let response = await client.guilds.fetch(id)
        .then(guild => {
            return guild.emojis.cache
        })
        .catch(console.error);
    return response;
}
