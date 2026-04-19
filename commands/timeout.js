const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, parseDuration } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout (mute) a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(o => o.setName('user').setDescription('User to timeout').setRequired(true))
    .addStringOption(o => o.setName('duration').setDescription('Duration e.g. 10m, 1h, 1d (max 28d)').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)),
  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) return interaction.reply({ embeds: [errorEmbed('User not found.')], ephemeral: true });
    if (!target.moderatable) return interaction.reply({ embeds: [errorEmbed('I cannot timeout this user.')], ephemeral: true });

    const ms = parseDuration(durationStr);
    if (!ms) return interaction.reply({ embeds: [errorEmbed('Invalid duration format. Use: `10s`, `5m`, `2h`, `1d`.')], ephemeral: true });
    if (ms > 28 * 24 * 60 * 60 * 1000) return interaction.reply({ embeds: [errorEmbed('Maximum timeout is 28 days.')], ephemeral: true });

    await target.timeout(ms, `${reason} | By: ${interaction.user.tag}`);
    const until = Math.floor((Date.now() + ms) / 1000);
    await interaction.reply({
      embeds: [successEmbed(`**${target.user.tag}** has been timed out until <t:${until}:F>.\n**Reason:** ${reason}`, 'Member Timed Out')],
    });
  },
};
