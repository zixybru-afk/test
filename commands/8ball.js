const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const answers = [
  { text: 'It is certain.', positive: true },
  { text: 'It is decidedly so.', positive: true },
  { text: 'Without a doubt.', positive: true },
  { text: 'Yes, definitely.', positive: true },
  { text: 'You may rely on it.', positive: true },
  { text: 'As I see it, yes.', positive: true },
  { text: 'Most likely.', positive: true },
  { text: 'Outlook good.', positive: true },
  { text: 'Yes.', positive: true },
  { text: 'Signs point to yes.', positive: true },
  { text: 'Reply hazy, try again.', positive: null },
  { text: 'Ask again later.', positive: null },
  { text: 'Better not tell you now.', positive: null },
  { text: 'Cannot predict now.', positive: null },
  { text: 'Concentrate and ask again.', positive: null },
  { text: "Don't count on it.", positive: false },
  { text: 'My reply is no.', positive: false },
  { text: 'My sources say no.', positive: false },
  { text: 'Outlook not so good.', positive: false },
  { text: 'Very doubtful.', positive: false },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a question')
    .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)),
  cooldown: 3,

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const answer = answers[Math.floor(Math.random() * answers.length)];
    const color = answer.positive === true ? 0x2ecc71 : answer.positive === false ? 0xe74c3c : 0x95a5a6;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🎱 Magic 8-Ball')
      .addFields(
        { name: '❓ Question', value: question },
        { name: '🎱 Answer', value: `**${answer.text}**` },
      )
      .setFooter({ text: `Asked by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
