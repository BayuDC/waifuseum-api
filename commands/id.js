module.exports = {
    name: 'id',
    /** @param {import('discord.js').Message} message */
    async execute(message) {
        const target =
            message.mentions.users.first() || message.mentions.channels.first() || message.mentions.roles.first();
        if (!target)
            return message.reply({
                content: 'Please mention a user, channel, or roles!',
            });
        if (target.username) {
            await message.channel.send({
                content: `The user is is \`${target.id}\``,
            });
        } else if (target.type === 'GUILD_TEXT') {
            await message.channel.send({
                content: `The channel id is \`${target.id}\``,
            });
        } else if (target.position) {
            await message.channel.send({
                content: `The role id is \`${target.id}\``,
            });
        } else {
            await message.reply({ content: 'Invalid argument' });
        }
    },
};
