const fs = require('fs/promises');
const config = require('../config.json');

module.exports = {
    name: 'config',
    /** @param {import('discord.js').Message} message */
    async execute(message, key, value) {
        switch (key) {
            case 'server':
            case 'serverId':
                config.serverId = value;
                break;
        }

        await fs.writeFile('./config.json', JSON.stringify(config, null, 2), 'utf8');
        await message.channel.send(`The value of \`${key}\` is now \`${value}\``);
    },
};
