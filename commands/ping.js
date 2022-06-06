module.exports = {
    name: 'ping',
    async execute(message) {
        await message.channel.send('Pong!');
    },
};
