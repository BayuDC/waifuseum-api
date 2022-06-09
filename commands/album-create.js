const { MessageEmbed } = require('discord.js');
const Album = require('../models/album');
const { parent } = require('../config.json');

module.exports = {
    name: 'album-create',
    /** @param {import('discord.js').Message} message */
    async execute(message, name, slug) {
        const channel = await message.guild.channels.create(name);
        await channel.setParent(parent);

        const album = await Album.create({ name, slug, channelId: channel.id });
        message.client.dbChannels.set(album.id, channel);

        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#36AE7C',
                    title: 'Album Created',
                    fields: [
                        { name: 'Name', value: name, inline: true },
                        { name: 'Slug', value: slug, inline: true },
                        { name: 'Channel', value: `<#${channel.id}>` },
                    ],
                }).setTimestamp(),
            ],
        });
    },
    validations: [
        (value, args) => {
            value = args.join(' ');
            if (!value) throw new Error('Album name is required');
            return value;
        },
        async (value, args) => {
            value = args
                .join('-')
                .toLowerCase()
                .replace(/[^a-z0-9\-\_]/g, '');

            if (await Album.exists({ slug: value })) throw new Error('Album already exists');

            return value;
        },
    ],
};
