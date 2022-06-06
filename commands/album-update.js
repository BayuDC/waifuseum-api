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

        const channel = await message.client.channels.fetch(album.channelId);

        switch (key) {
            case 'name':
                value = value.join(' ');

                await Album.updateOne(album, { name: value });
                break;

            case 'slug':
                value = value[0];

                if (album.slug != value && (await Album.findOne({ slug: value })))
                    return await message.channel.send(`Album with slug **${value}** already exists.`);

                await Album.updateOne(album, { slug: value });
                await channel.setName(value);

                message.client.albumChannels.delete(album.slug);
                message.client.albumChannels.set(value[0], channel);
                break;
        }

        await message.channel.send(`Album **${name}** successfully updated.`);
        await message.channel.send(`The new value for **${key}** is **${value}**.`);
    },
};
