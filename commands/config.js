const { MessageEmbed } = require('discord.js');
const fs = require('fs/promises');
const config = require('../config.json').bot;

module.exports = {
    name: 'config',
    owner: true,
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
            case 'parent':
                config.parent = value;
                break;
            case 'owner':
                config.owner = value;
                break;
            case 'admin':
                config.admin = value;
                break;
            case 'worker':
                config.worker = value;
                break;
            default:
                return await message.channel.send({
                    embeds: [
                        new MessageEmbed({
                            color: '#36AE7C',
                            description: `:white_check_mark: Nothing updated`,
                        }),
                    ],
                });
        }

        await fs.writeFile('./config.json', JSON.stringify(config, null, 2), 'utf8');
        await message.channel.send({
            embeds: [
                new MessageEmbed({
                    color: '#47B5FF',
                    description: `:white_check_mark: The value of \`${key}\` is now \`${value}\``,
                }),
            ],
        });
    },
};
