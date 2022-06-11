const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'ping',
    async execute(message) {
        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#47B5FF',
                    title: ':ping_pong: Pong!',
                    description: `:signal_strength: Ping Latency : ${message.client.ws.ping}ms`,
                }),
            ],
        });
    },
};
