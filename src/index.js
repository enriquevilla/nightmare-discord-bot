const Discord = require('discord.js');
const client = new Discord.Client();
const bosses = require('../data/bosses.json');
const {GUILD_ID, TOKEN} = require('../config');
const { Emojis, Bosses, Drops } = require('../utils');
const { nightmareKill, doubleDrop } = require('../boss/Nightmare');
let emojis;

client.on('ready', () => {
    Emojis(GUILD_ID).then(response => {emojis = response});
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
            // if (cmd === 'help') {
            //     msg.channel.send(Bosses)
            // }

            // !k !kill
            // if (cmd === 'k' || cmd === 'kill') {
                if (args[0] === 'nm' || args[0] === 'nightmare') {
                    args = args.splice(1);
                    msg.channel.send(Drops(nightmareKill(args)));
                }
                if (args[0] === 'nmdoubledrop' || args[0] === 'nmdd') {
                    args = args.splice(1);
                    msg.channel.send(doubleDrop(args));
                }
            // }
        }
    }
});

client.login(TOKEN);