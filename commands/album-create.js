const Album = require('../models/album');

module.exports = {
    name: 'album-create',
    /** @param {import('discord.js').Message} message */
    async execute(message, name) {
        if (!name) return await message.channel.send('Album name is required.');

        const album = await Album.findOne({ name });

        if (album) return await message.channel.send(`Album **${name}** already exists.`);

        const channel = await message.guild.channels.create(name);
        await channel.setParent(message.channel.parent);

        await Album.create({ name, slug: name, channelId: channel.id });

        await message.channel.send(`Album **${name}** created at ${channel.toString()}.`);
    },
};
