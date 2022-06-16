const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'avatar',
    /** @param {import('discord.js').Message} message */
    async execute(message) {
        const user = message.mentions.users.first() || message.author;
        const imgUrl = user.displayAvatarURL({
            size: 2048,
            dynamic: true,
        });
        const png = user.displayAvatarURL({ size: 2048, format: 'png' });
        const jpg = user.displayAvatarURL({ size: 2048, format: 'jpg' });
        const webp = user.displayAvatarURL({
            size: 2048,
            format: 'webp',
        });
        const gif = user.displayAvatarURL({ size: 2048, format: 'gif' });
        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#47B5FF',
                    title: `${user.username}'s Avatar`,
                    description: `[PNG](${png}) | [JPG](${jpg}) | [WEBP](${webp}) | [GIF](${gif})`,
                    image: { url: imgUrl },
                    footer: { text: user.tag },
                }).setTimestamp(),
            ],
        });
    },
};
