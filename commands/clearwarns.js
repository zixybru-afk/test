const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { clearWarnings } = require('../utils/store');
const { successEmbed, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Clear all warnings for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption(o => o.setName('user').setDescription('User to clear').setRequired(true)),
  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const count = clearWarnings(interaction.guild.id, target.id);
    await interaction.reply({ embeds: [successEmbed(`Cleared **${count}** warning(s) for **${target.tag}**.`)] });
  },
};
