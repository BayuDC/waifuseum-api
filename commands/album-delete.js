const { MessageEmbed } = require('discord.js');
const { isMongoId } = require('validator').default;
const Album = require('../models/album');

module.exports = {
    name: 'album-delete',
    /** @param {import('discord.js').Message} message */
    async execute(message, album) {
        const channel = await message.client.channels.fetch(album.channelId);
        await channel.delete();

        await Album.deleteOne(album);
        message.client.dbChannels.delete(album.id);

        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#36AE7C',
                    title: `Album Deleted`,
                }).setTimestamp(),
            ],
        });
    },
    validations: [
        async (value, args) => {
            value = args.join(' ');
            if (!value) throw new Error('Album identifier is required');

            const isId = isMongoId(value);
            const album = await Album.findOne(isId ? { _id: value } : { $or: [{ name: value }, { slug: value }] });
            if (!album) throw Error('Album does not exist');

            return album;
        },
    ],
};
