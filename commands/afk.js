const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { store } = require('../utils/store');
const { successEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set your AFK status')
    .addStringOption(o => o.setName('reason').setDescription('Why you are AFK').setRequired(false)),
  cooldown: 5,

  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'AFK';
    store.afk.set(interaction.user.id, { reason, since: Date.now() });
    await interaction.reply({
      embeds: [successEmbed(`You are now AFK: **${reason}**\nI'll let people know when they mention you.`, 'AFK Set')],
    });
  },
};
