const { readdirSync } = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { parent, server } = require('../config.json');
const Album = require('../models/album');

const prefix = process.env.BOT_PREFIX || '!';
const token = process.env.BOT_TOKEN;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
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

        let args = message.content.slice(prefix.length).trim().split(/ +/);
        let command = args.shift().toLowerCase();

        command = client.commands.get(command);
        if (!command) return message.channel.send('Command not found');

        if (command.validations) {
            try {
                args = await Promise.all(command.validations.map((validate, i) => validate(args[i], args)));
            } catch (error) {
                return message.channel.send({
                    embeds: [{ title: 'Invalid argument', description: error.message, color: '#EB5353' }],
                });
            }
        }

        await command.execute(message, ...args);
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
