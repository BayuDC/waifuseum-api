const { MessageEmbed } = require('discord.js');
const pretty = require('pretty-ms');

module.exports = {
    name: 'uptime',
    /** @param {import('discord.js').Message } message */
    async execute(message) {
        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#47B5FF',
                    description: `🕒 Uptime : ${pretty(message.client.uptime)}`,
                }),
            ],
        });
    },
};
