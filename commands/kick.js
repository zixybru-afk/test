const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the kick').setRequired(false)),
  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });
    if (!target.kickable) return interaction.reply({ embeds: [errorEmbed('I cannot kick this user.')], ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed('You cannot kick yourself.')], ephemeral: true });

    try {
      await target.send({ embeds: [errorEmbed(`You have been **kicked** from **${interaction.guild.name}**.\n**Reason:** ${reason}`, 'Kicked')] }).catch(() => {});
      await target.kick(`${reason} | By: ${interaction.user.tag}`);
      await interaction.reply({ embeds: [successEmbed(`**${target.user.tag}** has been kicked.\n**Reason:** ${reason}`, 'Member Kicked')] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to kick: ${err.message}`)], ephemeral: true });
    }
  },
};
