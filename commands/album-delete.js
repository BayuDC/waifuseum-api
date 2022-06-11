const { MessageEmbed } = require('discord.js');
const { isMongoId } = require('validator').default;
const Album = require('../models/album');

module.exports = {
    name: 'album-delete',
    owner: true,
    /** @param {import('discord.js').Message} message */
    async execute(message, album) {
        if (await album.picturesCount) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor('#EB5353')
                        .setTitle('Unable to Delete Album')
                        .setDescription('This album is not empty!'),
                ],
            });
        }
        const { author } = message;
        message = await message.channel.send('Are you sure to delete this album?');
        (await message.react('✅')) && (await message.react('❎'));

        const filter = (reaction, user) => ['✅', '❎'].includes(reaction.emoji.name) && user.id == author.id;
        const [collected] = await message.awaitReactions({ filter, max: 1, time: 10000 });

        await message.reactions.removeAll();
        if (!collected) return await message.channel.send('No respond');
        if (collected[0] == '❎') return await message.channel.send('Canceled!');
        if (collected[0] == '✅') {
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
        }
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
