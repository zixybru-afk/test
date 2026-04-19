const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getXP, getLeaderboard } = require('../utils/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your XP rank')
    .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(false)),
  cooldown: 5,

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const data = getXP(interaction.guild.id, target.id);
    const lb = getLeaderboard(interaction.guild.id, 100);
    const rank = lb.findIndex(e => e.userId === target.id) + 1;

    const nextLevelXP = Math.pow((data.level + 1) / 0.1, 2);
    const progress = Math.min(Math.floor((data.xp / nextLevelXP) * 20), 20);
    const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`📊 ${target.username}'s Rank`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: 'Level', value: `**${data.level}**`, inline: true },
        { name: 'XP', value: `**${data.xp}** / ${Math.ceil(nextLevelXP)}`, inline: true },
        { name: 'Server Rank', value: rank > 0 ? `**#${rank}**` : 'Unranked', inline: true },
        { name: 'Progress', value: `\`${bar}\` ${Math.floor((data.xp / nextLevelXP) * 100)}%` },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
