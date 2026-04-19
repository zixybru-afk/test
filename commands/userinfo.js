const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user')
    .addUserOption(o => o.setName('user').setDescription('The user to look up').setRequired(false)),
  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getMember('user') || interaction.member;
    const user = target.user;

    const roles = target.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString())
      .slice(0, 10);

    const embed = new EmbedBuilder()
      .setColor(target.displayHexColor || 0x5865f2)
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Nickname', value: target.nickname || 'None', inline: true },
        { name: 'Bot?', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
        { name: 'Joined Server', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:F>`, inline: false },
        { name: `Roles (${target.roles.cache.size - 1})`, value: roles.join(', ') || 'None', inline: false },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
