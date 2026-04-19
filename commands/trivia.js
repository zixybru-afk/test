const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const questions = [
  { q: 'What is the capital of France?', options: ['London', 'Paris', 'Berlin', 'Rome'], answer: 1 },
  { q: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], answer: 1 },
  { q: 'What is 7 × 8?', options: ['54', '56', '64', '48'], answer: 1 },
  { q: 'What programming language was JavaScript originally named?', options: ['LiveScript', 'CoffeeScript', 'TypeScript', 'JScript'], answer: 0 },
  { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], answer: 2 },
  { q: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperText Machine Language', 'HyperText Markdown Language'], answer: 0 },
  { q: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], answer: 1 },
  { q: 'How many bits are in a byte?', options: ['4', '16', '8', '32'], answer: 2 },
  { q: 'What is the chemical symbol for gold?', options: ['Ag', 'Au', 'Go', 'Gd'], answer: 1 },
  { q: 'Which country invented pizza?', options: ['France', 'Spain', 'Greece', 'Italy'], answer: 3 },
];

const letters = ['A', 'B', 'C', 'D'];
const styles = [ButtonStyle.Primary, ButtonStyle.Success, ButtonStyle.Danger, ButtonStyle.Secondary];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Answer a random trivia question'),
  cooldown: 5,

  async execute(interaction) {
    const q = questions[Math.floor(Math.random() * questions.length)];
    const timeLimit = 20_000;

    const row = new ActionRowBuilder().addComponents(
      q.options.map((opt, i) =>
        new ButtonBuilder().setCustomId(`trivia_${i}`).setLabel(`${letters[i]}: ${opt}`).setStyle(styles[i])
      )
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🧠 Trivia Question')
      .setDescription(`**${q.q}**`)
      .setFooter({ text: 'You have 20 seconds!' })
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: timeLimit });

    collector.on('collect', async btn => {
      collector.stop();
      const chosen = parseInt(btn.customId.split('_')[1]);
      const correct = chosen === q.answer;

      const resultEmbed = new EmbedBuilder()
        .setColor(correct ? 0x2ecc71 : 0xe74c3c)
        .setTitle(correct ? '✅ Correct!' : '❌ Wrong!')
        .setDescription(`**${q.q}**\n\nThe correct answer was: **${letters[q.answer]}: ${q.options[q.answer]}**`)
        .setTimestamp();

      const disabledRow = new ActionRowBuilder().addComponents(
        q.options.map((opt, i) =>
          new ButtonBuilder()
            .setCustomId(`trivia_${i}`)
            .setLabel(`${letters[i]}: ${opt}`)
            .setStyle(i === q.answer ? ButtonStyle.Success : i === chosen && !correct ? ButtonStyle.Danger : ButtonStyle.Secondary)
            .setDisabled(true)
        )
      );

      await btn.update({ embeds: [resultEmbed], components: [disabledRow] });
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0x95a5a6)
          .setTitle('⏰ Time\'s Up!')
          .setDescription(`The correct answer was: **${letters[q.answer]}: ${q.options[q.answer]}**`)
          .setTimestamp();
        await msg.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  },
};
