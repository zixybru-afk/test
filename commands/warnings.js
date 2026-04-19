const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getWarnings } = require('../utils/store');
const { infoEmbed, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(true)),
  cooldown: 3,

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const warns = getWarnings(interaction.guild.id, target.id);

    if (warns.length === 0) {
      return interaction.reply({ embeds: [infoEmbed(`**${target.tag}** has no warnings.`)] });
    }

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle(`⚠️ Warnings for ${target.tag}`)
      .setDescription(
        warns.map((w, i) =>
          `**${i + 1}.** ${w.reason}\n> By: <@${w.moderatorId}> | <t:${Math.floor(w.timestamp / 1000)}:R>`
        ).join('\n\n')
      )
      .setFooter({ text: `Total: ${warns.length} warning(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
