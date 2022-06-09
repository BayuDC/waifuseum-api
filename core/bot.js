const { readdirSync } = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { parent, server } = require('../config.json');
const Album = require('../models/album');

const prefix = process.env.BOT_PREFIX || '!';
const token = process.env.BOT_TOKEN;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.commands = new Collection();
client.dbChannels = new Collection();
client.dbServer = {};
client.dbParent = {};

readdirSync('./commands').forEach(file => {
    const command = require(`../commands/` + file);
    client.commands.set(command.name, command);
});

client.on('messageCreate', async message => {
    try {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!client.commands.has(command)) return;

        await client.commands.get(command).execute(message, ...args);
    } catch (error) {
        await message.channel.send('Something went wrong');
        console.log(error);
    }
});

module.exports = next => {
    client.once('ready', () => {
        console.log('Discord bot is ready!');

        Album.find().then(albums => {
            albums.forEach(album => {
                client.channels.fetch(album.channelId).then(channel => {
                    client.dbChannels.set(album.id, channel);
                });
            });
        });
        client.guilds.fetch(server).then(guild => Object.assign(client.dbServer, guild));
        client.channels.fetch(parent).then(channel => Object.assign(client.dbParent, channel));

        next(client);
    });

    client.login(token);
};
