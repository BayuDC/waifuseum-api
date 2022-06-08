const fs = require('fs/promises');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: 'config',
    /** @param {import('discord.js').Message} message */
    async execute(message, key, value) {
        if (!key) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed({
                        color: '#36AE7C',
                        title: 'Current Configuration',
                        description: `\`\`\`${JSON.stringify(config, null, 2)}\`\`\``,
                    }).setTimestamp(),
                ],
            });
        }

        switch (key) {
            case 'server':
                config.server = value;
                break;
            default:
                return await message.channel.send('Nothing updated');
        }

        await fs.writeFile('./config.json', JSON.stringify(config, null, 2), 'utf8');
        await message.channel.send(`The value of \`${key}\` is now \`${value}\``);
    },
};
