const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { store } = require('../utils/store');
const { successEmbed, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Configure automatic roles given when a member joins')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(s =>
      s.setName('add').setDescription('Add a role to auto-assign')
        .addRoleOption(o => o.setName('role').setDescription('Role to auto-assign').setRequired(true)))
    .addSubcommand(s =>
      s.setName('remove').setDescription('Remove a role from auto-assign')
        .addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List current auto-roles')),
  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    if (!store.autoRoles.has(guildId)) store.autoRoles.set(guildId, []);
    const roles = store.autoRoles.get(guildId);

    if (sub === 'add') {
      const role = interaction.options.getRole('role');
      if (roles.includes(role.id)) return interaction.reply({ embeds: [errorEmbed('That role is already in the auto-role list.')], ephemeral: true });
      if (roles.length >= 5) return interaction.reply({ embeds: [errorEmbed('Maximum 5 auto-roles allowed.')], ephemeral: true });
      roles.push(role.id);
      await interaction.reply({ embeds: [successEmbed(`${role} will now be given to all new members.`)] });
    }

    if (sub === 'remove') {
      const role = interaction.options.getRole('role');
      const idx = roles.indexOf(role.id);
      if (idx === -1) return interaction.reply({ embeds: [errorEmbed('That role is not in the auto-role list.')], ephemeral: true });
      roles.splice(idx, 1);
      await interaction.reply({ embeds: [successEmbed(`${role} removed from auto-roles.`)] });
    }

    if (sub === 'list') {
      if (roles.length === 0) return interaction.reply({ content: 'No auto-roles configured.', ephemeral: true });
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('🎭 Auto-Roles')
        .setDescription(roles.map(id => `<@&${id}>`).join('\n'))
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
};
