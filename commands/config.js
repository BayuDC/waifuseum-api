const fs = require('fs/promises');
const config = require('../config.json');

module.exports = {
    name: 'config',
    /** @param {import('discord.js').Message} message */
    async execute(message, key, value) {
        if (!key) {
            return message.channel.send(`The current configuration is: \`\`\`${JSON.stringify(config, null, 4)}\`\`\``);
        }

        switch (key) {
            case 'server':
                config.server = value;
                break;
        }

        await fs.writeFile('./config.json', JSON.stringify(config, null, 2), 'utf8');
        await message.channel.send(`The value of \`${key}\` is now \`${value}\``);
    },
};
