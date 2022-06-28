const { readdirSync } = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { server, owner, admin } = require('../config.json').bot;
const Album = require('../models/album');

const prefix = process.env.BOT_PREFIX || '!';
const token = process.env.BOT_TOKEN;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

client.commands = new Collection();
client.data = {
    channels: new Collection(),
    server: undefined,
};

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
        if (!command)
            return message.channel.send({
                embeds: [
                    new MessageEmbed({
                        description: ':x: Command not found',
                        color: '#EB5353',
                    }),
                ],
            });

        if (
            (command.owner && !message.member.roles.cache.has(owner)) ||
            (command.admin && !message.member.roles.cache.has(admin))
        ) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed({
                        description: ':x: You do not have permission to use this command',
                        color: '#EB5353',
                    }),
                ],
            });
        }

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
        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#EB5353',
                    description: ':x: Something went wrong',
                }),
            ],
        });
        console.log(error);
    }
});

module.exports = next => {
    client.once('ready', () => {
        console.log('Discord bot is ready!');

        Album.find()
            .select('channelId')
            .then(albums => {
                albums.forEach(album => {
                    client.channels.fetch(album.channelId).then(channel => {
                        client.data.channels.set(album.id, channel);
                    });
                });
            });
        client.guilds.fetch(server).then(guild => (client.data.server = guild));
        client.user.setActivity({ type: 'PLAYING', name: 'with your waifu' });

        next(client.data);
    });

    client.login(token);
};
