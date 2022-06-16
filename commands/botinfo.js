const { MessageEmbed, version } = require('discord.js');
const project = require('../package.json');
const pretty = require('pretty-ms');

module.exports = {
    name: 'botinfo',
    /** @param {import('discord.js').Message} message */
    async execute(message) {
        const client = message.client;
        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#47B5FF',
                    thumbnail: { url: client.user.displayAvatarURL({ size: 512 }) },
                    title: `:robot: ${client.user.username} Information`,
                    description: `**❯ Client :** ${client.user.tag} (${client.user.id})\n**❯ Commands Total :** ${
                        client.commands.size
                    }\n**❯ Server :** ${client.guilds.cache.size.toLocaleString()} Servers\n**❯ Users :** ${client.guilds.cache
                        .reduce((a, b) => a + b.memberCount, 0)
                        .toLocaleString()} Users\n**❯ Channels :** ${client.channels.cache.size.toLocaleString()} Channels\n**❯ Node.js :** ${
                        process.version
                    }\n**❯ Project Version :** v${
                        project.version
                    }\n**❯ Discord.js :** v${version}\n**❯ Bot Uptime :** ${pretty(client.uptime)}`,
                }).setTimestamp(),
            ],
        });
    },
};
