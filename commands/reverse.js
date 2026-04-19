const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reverse')
    .setDescription('Reverse a piece of text')
    .addStringOption(o => o.setName('text').setDescription('Text to reverse').setRequired(true)),
  cooldown: 3,

  async execute(interaction) {
    const text = interaction.options.getString('text');
    const reversed = text.split('').reverse().join('');
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔄 Text Reversed')
      .addFields(
        { name: 'Original', value: text },
        { name: 'Reversed', value: reversed },
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
