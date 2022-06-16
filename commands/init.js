const { MessageEmbed } = require('discord.js');
const fs = require('fs/promises');
const config = require('../config.json').bot;

module.exports = {
    name: 'init',
    owner: true,
    /** @param {import('discord.js').Message} message */
    async execute(message) {
        config.server = message.guildId;
        config.parent = message.channel.parentId;

        await fs.writeFile('./config.json', JSON.stringify(config, null, 2), 'utf8');
        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#36AE7C',
                    title: 'Initialized',
                    description: `Initialized configuration to \`config.json\`\n\`\`\`${JSON.stringify(
                        config,
                        null,
                        2
                    )}\`\`\``,
                }).setTimestamp(),
            ],
        });
    },
};
