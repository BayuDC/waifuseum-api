const Album = require('../models/album');

module.exports = {
    name: 'album-update',
    /** @param {import('discord.js').Message} message */
    async execute(message, name, key, ...value) {
        if (!name) return await message.channel.send('Album name is required.');
        if (!key) return await message.channel.send('Album key is required.');
        if (!value.length) return await message.channel.send('Album value is required.');

        const album = await Album.findOne({ slug: name });
        if (!album) return await message.channel.send(`Album **${name}** does not exist.`);

        album[key] = value.join(' ');
        await album.save();

        await message.channel.send(`Album **${name}** successfully updated.`);
        await message.channel.send(`The new value for **${key}** is **${album[key]}**.`);
    },
};
