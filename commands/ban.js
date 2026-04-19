const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the ban').setRequired(false))
    .addIntegerOption(o => o.setName('days').setDescription('Days of messages to delete (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)),
  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;

    if (!target) return interaction.reply({ embeds: [errorEmbed('User not found in this server.')], ephemeral: true });
    if (!target.bannable) return interaction.reply({ embeds: [errorEmbed('I cannot ban this user. They may have a higher role than me.')], ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed('You cannot ban yourself.')], ephemeral: true });

    try {
      await target.send({ embeds: [errorEmbed(`You have been **banned** from **${interaction.guild.name}**.\n**Reason:** ${reason}`, 'Banned')] }).catch(() => {});
      await target.ban({ deleteMessageSeconds: days * 86400, reason: `${reason} | By: ${interaction.user.tag}` });
      await interaction.reply({
        embeds: [successEmbed(`**${target.user.tag}** has been banned.\n**Reason:** ${reason}\n**Messages deleted:** ${days} day(s)`, 'Member Banned')],
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Failed to ban: ${err.message}`)], ephemeral: true });
    }
  },
};
