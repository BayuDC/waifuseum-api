const { MessageEmbed } = require('discord.js');
const { version } = require('../package.json');

module.exports = {
    name: 'version',
    /** @param {import('discord.js').Message} message */
    async execute(message) {
        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#47B5FF',
                    description: `:diamond_shape_with_a_dot_inside: Currently running on version **${version}**`,
                }),
            ],
        });
    },
};
