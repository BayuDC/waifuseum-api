const { readdirSync } = require('fs');
const { Client, Collection, Intents } = require('discord.js');

const prefix = process.env.BOT_PREFIX || '!';
const token = process.env.BOT_TOKEN;

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.commands = new Collection();
readdirSync('./commands').forEach(file => {
    const command = require(`../commands/` + file);
    client.commands.set(command.name, command);
});

client.on('messageCreate', async message => {
    try {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!client.commands.has(command)) return;

        await client.commands.get(command).execute(message, ...args);
    } catch (error) {
        await message.channel.send('Something went wrong');
        console.log(error);
    }
});

module.exports = next => {
    client.once('ready', () => {
        console.log('Discord bot is ready!');

        next(client);
    });

    client.login(token);
};
