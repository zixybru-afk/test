const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin')
    .addStringOption(o =>
      o.setName('call').setDescription('Call it!').setRequired(false)
        .addChoices({ name: 'Heads', value: 'heads' }, { name: 'Tails', value: 'tails' })
    ),
  cooldown: 3,

  async execute(interaction) {
    const call = interaction.options.getString('call');
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = call ? call === result : null;
    const emoji = result === 'heads' ? '🪙' : '🔴';

    const embed = new EmbedBuilder()
      .setColor(won === true ? 0x2ecc71 : won === false ? 0xe74c3c : 0xf39c12)
      .setTitle(`${emoji} Coin Flip`)
      .setDescription(`The coin landed on **${result.toUpperCase()}**!`)
      .setTimestamp();

    if (call) {
      embed.addFields({ name: won ? '✅ You won!' : '❌ You lost!', value: `You called **${call}**.` });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
