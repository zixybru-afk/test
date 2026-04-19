const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a previously locked channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(o => o.setName('channel').setDescription('Channel to unlock').setRequired(false)),
  cooldown: 3,

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null,
    });

    await interaction.reply({ embeds: [successEmbed(`🔓 ${channel} has been unlocked.`)] });
    if (channel.id !== interaction.channelId) {
      await channel.send({ embeds: [successEmbed(`🔓 This channel has been unlocked by ${interaction.user}.`)] });
    }
  },
};
