const { Client, Collection } = require('discord.js');
const { server } = require('../config.json').bot;
const Album = require('../models/album');

const token = process.env.DISCORD_BOT_TOKEN;

const client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES'],
});

client.data = {
    channels: new Collection(),
    server: undefined,
};

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
