const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const https = require('https');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'DiscordBot/1.0' } }, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON')); }
      });
    }).on('error', reject);
  });
}

const subreddits = ['memes', 'dankmemes', 'me_irl', 'programmerhumor', 'funny'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme from Reddit')
    .addStringOption(o =>
      o.setName('subreddit').setDescription('Subreddit to fetch from').setRequired(false)
        .addChoices(
          { name: 'memes', value: 'memes' },
          { name: 'dankmemes', value: 'dankmemes' },
          { name: 'me_irl', value: 'me_irl' },
          { name: 'programmerhumor', value: 'programmerhumor' },
          { name: 'funny', value: 'funny' },
        )
    ),
  cooldown: 5,

  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getString('subreddit') || subreddits[Math.floor(Math.random() * subreddits.length)];

    try {
      const data = await httpsGet(`https://www.reddit.com/r/${sub}/random.json?limit=1`);
      const post = data?.[0]?.data?.children?.[0]?.data;
      if (!post || post.over_18) return interaction.editReply({ content: 'Could not fetch a meme. Try again!' });

      const embed = new EmbedBuilder()
        .setColor(0xff4500)
        .setTitle(post.title.slice(0, 256))
        .setURL(`https://reddit.com${post.permalink}`)
        .setImage(post.url)
        .addFields(
          { name: '👍 Upvotes', value: `${post.ups}`, inline: true },
          { name: '💬 Comments', value: `${post.num_comments}`, inline: true },
          { name: '📌 Subreddit', value: `r/${sub}`, inline: true },
        )
        .setFooter({ text: `Posted by u/${post.author}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: 'Could not fetch a meme right now. Try again later!' });
    }
  },
};
