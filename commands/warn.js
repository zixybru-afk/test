const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, warnEmbed } = require('../utils/helpers');
const { addWarning, getWarnings } = require('../utils/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the warning').setRequired(true)),
  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason');

    if (!target) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    if (target.user.bot) return interaction.reply({ embeds: [errorEmbed('Cannot warn bots.')], ephemeral: true });

    const count = addWarning(interaction.guild.id, target.id, reason, interaction.user.id);

    await target.send({
      embeds: [warnEmbed(`You have been warned in **${interaction.guild.name}**.\n**Reason:** ${reason}\n**Total warnings:** ${count}`, 'Warning Received')],
    }).catch(() => {});

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf39c12)
          .setTitle('⚠️ Member Warned')
          .addFields(
            { name: 'User', value: `${target.user.tag}`, inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: true },
            { name: 'Total Warnings', value: `${count}`, inline: true },
            { name: 'Reason', value: reason },
          )
          .setTimestamp(),
      ],
    });
  },
};
