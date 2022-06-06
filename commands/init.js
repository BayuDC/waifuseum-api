const fs = require('fs/promises');
const config = require('../config.json');

module.exports = {
    name: 'init',
    /** @param {import('discord.js').Message} message */
    async execute(message) {
        config.server = message.guildId;

        await fs.writeFile('./config.json', JSON.stringify(config, null, 2), 'utf8');
        await message.channel.send('Config has been initialized.');
        await message.channel.send('```' + JSON.stringify(config, null, 2) + '```');
    },
};
