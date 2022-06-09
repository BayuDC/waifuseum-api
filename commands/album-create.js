const { MessageEmbed } = require('discord.js');
const Album = require('../models/album');

module.exports = {
    name: 'album-create',
    /** @param {import('discord.js').Message} message */
    async execute(message, name) {
        if (!name) return await message.channel.send('Album name is required.');

        let album = await Album.findOne({ slug: name });

        if (album) return await message.channel.send(`Album **${name}** already exists.`);

        const channel = await message.guild.channels.create(name);
        await channel.setParent(message.channel.parent);

        album = await Album.create({ name, slug: name, channelId: channel.id });
        message.client.dbChannels.set(album.id, channel);

        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#36AE7C',
                    title: 'Album Created',
                    fields: [
                        { name: 'Name', value: name, inline: true },
                        { name: 'Slug', value: name, inline: true },
                        { name: 'Channel', value: `<#${channel.id}>` },
                    ],
                }).setTimestamp(),
            ],
        });
    },
};
