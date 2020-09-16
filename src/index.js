const Discord = require('discord.js');
const client = new Discord.Client();
const {GUILD_ID, TOKEN} = require('../config');
import { Emojis, Drops } from '../utils';
import { nightmareKill, doubleDrop } from '../boss/Nightmare';
let emojis;

client.on('ready', () => {
    Emojis(client, GUILD_ID).then(response => {emojis = response});
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
            // !author
            if (cmd === 'author') {
                msg.channel.send(`Enrique Villa\nhttps://www.github.com/enriquevilla`);
            }
            if (cmd === 'nm' || cmd === 'nightmare') {
                msg.channel.send(Drops(nightmareKill(args, emojis)));
            }
            if (cmd === 'nmdoubledrop' || cmd === 'nmdd') {
                msg.channel.send(doubleDrop(args));
            }
        }
    }
});

client.login(TOKEN);