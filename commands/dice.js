const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll dice')
    .addIntegerOption(o => o.setName('sides').setDescription('Number of sides (default 6)').setMinValue(2).setMaxValue(1000).setRequired(false))
    .addIntegerOption(o => o.setName('count').setDescription('Number of dice (default 1)').setMinValue(1).setMaxValue(20).setRequired(false)),
  cooldown: 3,

  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const count = interaction.options.getInteger('count') || 1;
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`🎲 Dice Roll (${count}d${sides})`)
      .addFields(
        { name: 'Rolls', value: rolls.join(', '), inline: true },
        { name: 'Total', value: `**${total}**`, inline: true },
      )
      .setFooter({ text: `Rolled by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
