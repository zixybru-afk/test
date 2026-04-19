const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const jokes = [
  { setup: 'Why do programmers prefer dark mode?', punchline: 'Because light attracts bugs!' },
  { setup: "Why can't a bike stand on its own?", punchline: "Because it's two-tired!" },
  { setup: 'What do you call fake spaghetti?', punchline: 'An impasta!' },
  { setup: 'How do you organize a space party?', punchline: 'You planet.' },
  { setup: "Why don't scientists trust atoms?", punchline: 'Because they make up everything!' },
  { setup: 'What did the ocean say to the beach?', punchline: 'Nothing, it just waved.' },
  { setup: 'How many programmers does it take to change a light bulb?', punchline: 'None - that is a hardware problem.' },
  { setup: 'Why was the math book sad?', punchline: 'It had too many problems.' },
  { setup: 'What do you call a fish without eyes?', punchline: 'A fsh!' },
  { setup: "I'm reading a book about anti-gravity.", punchline: "It's impossible to put down!" },
  { setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts." },
  { setup: 'I told my wife she was drawing her eyebrows too high.', punchline: 'She looked surprised.' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tell a random joke'),
  cooldown: 3,

  async execute(interaction) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('😄 Random Joke')
      .addFields(
        { name: '❓ Setup', value: joke.setup },
        { name: '😂 Punchline', value: `||${joke.punchline}||` },
      )
      .setFooter({ text: '(Click the spoiler to reveal!)' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
