const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Get information about a role')
    .addRoleOption(o => o.setName('role').setDescription('The role to inspect').setRequired(true)),
  cooldown: 5,

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const perms = role.permissions.toArray().slice(0, 10).map(p => `\`${p}\``).join(', ') || 'None';
    const members = interaction.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;

    const embed = new EmbedBuilder()
      .setColor(role.hexColor)
      .setTitle(`🎭 Role: ${role.name}`)
      .addFields(
        { name: 'Role ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        { name: 'Position', value: `${role.position}`, inline: true },
        { name: 'Members', value: `${members}`, inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: false },
        { name: `Permissions (first 10)`, value: perms, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
