const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const categories = {
  '🛡️ Moderation': ['ban', 'kick', 'warn', 'warnings', 'clearwarns', 'purge', 'slowmode', 'timeout', 'lock', 'unlock'],
  '🎉 Fun': ['8ball', 'coinflip', 'dice', 'rps', 'meme', 'joke', 'fact', 'quote', 'reverse'],
  '📊 Leveling': ['rank', 'leaderboard'],
  '🔧 Utility': ['userinfo', 'serverinfo', 'avatar', 'banner', 'roleinfo', 'ping', 'remind', 'afk', 'poll', 'tag', 'giveaway', 'welcome', 'autorole'],
  '🎲 Games': ['guess', 'trivia', 'hangman'],
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all commands and their descriptions'),
  cooldown: 5,

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📖 Command Help')
      .setDescription('Select a category below to see commands.\n\nThis bot has **no database** — XP, warnings, and polls reset on restart.')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    for (const [cat, cmds] of Object.entries(categories)) {
      embed.addFields({ name: cat, value: cmds.map(c => `\`/${c}\``).join(', '), inline: false });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
