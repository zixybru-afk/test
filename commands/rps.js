const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const choices = ['rock', 'paper', 'scissors'];
const emoji = { rock: '🪨', paper: '📄', scissors: '✂️' };
const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play rock, paper, scissors against the bot')
    .addStringOption(o =>
      o.setName('choice').setDescription('Your choice').setRequired(true)
        .addChoices(
          { name: '🪨 Rock', value: 'rock' },
          { name: '📄 Paper', value: 'paper' },
          { name: '✂️ Scissors', value: 'scissors' },
        )
    ),
  cooldown: 3,

  async execute(interaction) {
    const player = interaction.options.getString('choice');
    const bot = choices[Math.floor(Math.random() * 3)];
    let result, color;

    if (player === bot) {
      result = "It's a tie!";
      color = 0x95a5a6;
    } else if (beats[player] === bot) {
      result = 'You win! 🎉';
      color = 0x2ecc71;
    } else {
      result = 'You lose! 😢';
      color = 0xe74c3c;
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('✂️ Rock, Paper, Scissors')
      .addFields(
        { name: 'Your pick', value: `${emoji[player]} **${player}**`, inline: true },
        { name: "Bot's pick", value: `${emoji[bot]} **${bot}**`, inline: true },
        { name: 'Result', value: `**${result}**`, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
