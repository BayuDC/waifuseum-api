const { writeFile } = require('fs/promises');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'init',
    owner: true,
    /** @param {import('discord.js').Message} message */
    async execute(message) {
        config.bot.server = message.guildId;
        config.bot.parent = message.channel.parentId;

        const configStr = JSON.stringify(config, null, 2);

        await writeFile('./config.json', configStr, 'utf8');
        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#36AE7C',
                    title: 'Initialized',
                    description: `Initialized configuration to \`config.json\`\n\`\`\`${configStr}\`\`\``,
                }).setTimestamp(),
            ],
        });
    },
};
