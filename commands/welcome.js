const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { store } = require('../utils/store');
const { successEmbed, errorEmbed, infoEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure the welcome message system')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s =>
      s.setName('set').setDescription('Set the welcome channel and message')
        .addChannelOption(o => o.setName('channel').setDescription('Welcome channel').setRequired(true))
        .addStringOption(o => o.setName('message').setDescription('Welcome message. Variables: {user} {server} {memberCount}').setRequired(true)))
    .addSubcommand(s => s.setName('disable').setDescription('Disable the welcome message'))
    .addSubcommand(s => s.setName('test').setDescription('Test the current welcome message')),
  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'set') {
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');
      store.welcomeConfig.set(guildId, { channelId: channel.id, message });
      await interaction.reply({
        embeds: [successEmbed(`Welcome messages enabled in ${channel}.\n**Message:** ${message}`)],
      });
    }

    if (sub === 'disable') {
      store.welcomeConfig.delete(guildId);
      await interaction.reply({ embeds: [successEmbed('Welcome messages have been disabled.')] });
    }

    if (sub === 'test') {
      const wc = store.welcomeConfig.get(guildId);
      if (!wc) return interaction.reply({ embeds: [errorEmbed('No welcome message configured. Use `/welcome set` first.')], ephemeral: true });
      const msg = wc.message
        .replace('{user}', `<@${interaction.user.id}>`)
        .replace('{server}', interaction.guild.name)
        .replace('{memberCount}', interaction.guild.memberCount);
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle(`👋 Welcome to ${interaction.guild.name}!`)
            .setDescription(msg)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter({ text: `Member #${interaction.guild.memberCount}` })
            .setTimestamp(),
        ],
      });
    }
  },
};
