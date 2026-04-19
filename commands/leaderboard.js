const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../utils/store');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the XP leaderboard')
    .addIntegerOption(o => o.setName('page').setDescription('Page number').setMinValue(1).setRequired(false)),
  cooldown: 5,

  async execute(interaction) {
    const page = interaction.options.getInteger('page') || 1;
    const perPage = 10;
    const lb = getLeaderboard(interaction.guild.id, 100);

    if (lb.length === 0) {
      return interaction.reply({ content: 'No XP data yet. Start chatting!', ephemeral: true });
    }

    const totalPages = Math.ceil(lb.length / perPage);
    const currentPage = Math.min(page, totalPages);
    const slice = lb.slice((currentPage - 1) * perPage, currentPage * perPage);

    const medals = ['🥇', '🥈', '🥉'];
    const lines = slice.map((entry, i) => {
      const pos = (currentPage - 1) * perPage + i + 1;
      const medal = medals[pos - 1] || `**${pos}.**`;
      return `${medal} <@${entry.userId}> — Level **${entry.level}** | **${entry.xp} XP**`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`🏆 XP Leaderboard — ${interaction.guild.name}`)
      .setDescription(lines.join('\n'))
      .setFooter({ text: `Page ${currentPage}/${totalPages} • ${lb.length} members ranked` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
