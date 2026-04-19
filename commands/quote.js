const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const quotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: 'Confucius' },
  { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { text: "Don't watch the clock; do what it does. Keep going.", author: 'Sam Levenson' },
  { text: 'Whether you think you can or you think you can\'t, you\'re right.', author: 'Henry Ford' },
  { text: "You miss 100% of the shots you don't take.", author: 'Wayne Gretzky' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'An unexamined life is not worth living.', author: 'Socrates' },
  { text: 'To be or not to be, that is the question.', author: 'William Shakespeare' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get a random inspirational quote'),
  cooldown: 3,

  async execute(interaction) {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('💬 Quote of the Moment')
      .setDescription(`*"${q.text}"*`)
      .setFooter({ text: `— ${q.author}` })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
