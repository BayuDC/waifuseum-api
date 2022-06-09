const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'id',
    /** @param {import('discord.js').Message} message */
    async execute(message) {
        const target =
            message.mentions.users.first() || message.mentions.channels.first() || message.mentions.roles.first();
        if (!target)
            return message.reply({
                embeds: [
                    new MessageEmbed({
                        color: '#EB5353',
                        title: ':x: Invalid argument',
                    }),
                ],
            });
        if (target.username) {
            await message.channel.send({
                embeds: [
                    new MessageEmbed({
                        color: '#47B5FF',
                        author: {
                            name: target.tag,
                            iconURL: target.displayAvatarURL(),
                        },
                        fields: [
                            { name: 'ID', value: `\`${target.id}\`` },
                            { name: 'Type', value: 'User' },
                        ],
                    }).setTimestamp(),
                ],
            });
        } else if (target.type === 'GUILD_TEXT') {
            await message.channel.send({
                embeds: [
                    new MessageEmbed({
                        color: '#47B5FF',
                        title: `Channel #${target.name}`,
                        fields: [
                            { name: 'ID', value: `\`${target.id}\`` },
                            { name: 'Type', value: 'Text channel' },
                        ],
                    }).setTimestamp(),
                ],
            });
        } else if (target.position) {
            await message.channel.send({
                embeds: [
                    new MessageEmbed({
                        color: '#47B5FF',
                        title: `Role @${target.name}`,
                        fields: [
                            { name: 'ID', value: `\`${target.id}\`` },
                            { name: 'Type', value: 'Role' },
                        ],
                    }).setTimestamp(),
                ],
            });
        }
    },
};
