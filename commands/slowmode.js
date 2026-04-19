const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode in seconds (0 to disable, max 21600)').setMinValue(0).setMaxValue(21600).setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel to set slowmode on').setRequired(false)),
  cooldown: 3,

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);

    if (seconds === 0) {
      await interaction.reply({ embeds: [successEmbed(`Slowmode disabled in ${channel}.`)] });
    } else {
      await interaction.reply({ embeds: [successEmbed(`Slowmode set to **${seconds}s** in ${channel}.`)] });
    }
  },
};
