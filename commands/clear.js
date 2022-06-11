const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'clear',
    /** @param {import('discord.js').Message} message */
    /** @param {String[]} args */
    async execute(message, ...args) {
        const amount = Number(args[0]) || parseInt(args[0]);
        if (isNaN(amount) || !Number.isInteger(amount))
            return message.reply({ content: 'Please enter a number of message to delete!' });
        if (amount < 2 || amount > 100)
            return message.reply({ content: 'Please enter a number of message between 2 and 100' });
        try {
            await message.delete();
            if (message.channel.type === 'GUILD_TEXT')
                await message.channel.bulkDelete(amount).then(async m => {
                    await message.channel
                        .send({
                            embeds: [
                                new MessageEmbed({
                                    color: '#47B5FF',
                                    description: `:white_check_mark: Deleted **${m.size}**/**${amount}** messages!`,
                                }),
                            ],
                        })
                        .then(msg => setTimeout(() => msg.delete(), 4000));
                });
        } catch (e) {
            console.log(e);
            await message.channel.send({
                content: `You can only delete the messages which are not older than 14 days.`,
            });
        }
    },
};
