const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const { store, nextId } = require('../utils/store');
const { parseDuration, formatDuration, errorEmbed } = require('../utils/helpers');

const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

function buildPollEmbed(poll) {
  const totalVotes = poll.options.reduce((a, o) => a + o.votes.size, 0);
  const desc = poll.options.map((opt, i) => {
    const pct = totalVotes ? Math.round((opt.votes.size / totalVotes) * 100) : 0;
    const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
    return `${numberEmojis[i]} **${opt.label}**\n\`${bar}\` ${pct}% (${opt.votes.size} votes)`;
  }).join('\n\n');

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📊 ${poll.question}`)
    .setDescription(desc)
    .setFooter({ text: `Total votes: ${totalVotes}` })
    .setTimestamp();

  if (poll.endsAt) embed.addFields({ name: 'Ends', value: `<t:${Math.floor(poll.endsAt / 1000)}:R>` });
  return embed;
}

function buildPollRows(poll, pollId, ended = false) {
  const rows = [];
  const chunk = [];
  for (let i = 0; i < poll.options.length; i++) {
    chunk.push(
      new ButtonBuilder()
        .setCustomId(`poll_vote_${pollId}_${i}`)
        .setLabel(poll.options[i].label)
        .setEmoji(numberEmojis[i])
        .setStyle(ButtonStyle.Primary)
        .setDisabled(ended),
    );
  }
  if (chunk.length) rows.push(new ActionRowBuilder().addComponents(...chunk));
  return rows;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('Option 3').setRequired(false))
    .addStringOption(o => o.setName('option4').setDescription('Option 4').setRequired(false))
    .addStringOption(o => o.setName('option5').setDescription('Option 5').setRequired(false))
    .addStringOption(o => o.setName('duration').setDescription('Poll duration (e.g. 5m, 1h, 1d) — leave blank for no limit').setRequired(false)),
  cooldown: 10,

  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const durationStr = interaction.options.getString('duration');
    const labels = [1, 2, 3, 4, 5]
      .map(n => interaction.options.getString(`option${n}`))
      .filter(Boolean);

    if (labels.length < 2) return interaction.reply({ embeds: [errorEmbed('You need at least 2 options.')], ephemeral: true });

    let ms = null;
    if (durationStr) {
      ms = parseDuration(durationStr);
      if (!ms) return interaction.reply({ embeds: [errorEmbed('Invalid duration format.')], ephemeral: true });
    }

    const pollId = nextId('poll');
    const poll = {
      question,
      options: labels.map(l => ({ label: l, votes: new Set() })),
      channelId: interaction.channelId,
      creatorId: interaction.user.id,
      endsAt: ms ? Date.now() + ms : null,
    };

    store.polls.set(pollId, poll);

    const msg = await interaction.reply({
      embeds: [buildPollEmbed(poll)],
      components: buildPollRows(poll, pollId),
      fetchReply: true,
    });

    poll.messageId = msg.id;

    const collector = msg.createMessageComponentCollector({ time: ms || 7 * 24 * 60 * 60 * 1000 });

    collector.on('collect', async btn => {
      const [, , pid, optIdx] = btn.customId.split('_');
      const p = store.polls.get(pid);
      if (!p) return btn.reply({ content: 'Poll not found.', ephemeral: true });

      const idx = parseInt(optIdx);
      let changed = false;
      for (let i = 0; i < p.options.length; i++) {
        if (i === idx) {
          if (p.options[i].votes.has(btn.user.id)) {
            p.options[i].votes.delete(btn.user.id);
            await btn.reply({ content: 'Your vote has been removed.', ephemeral: true });
          } else {
            p.options[i].votes.add(btn.user.id);
            await btn.reply({ content: `You voted for **${p.options[i].label}**.`, ephemeral: true });
          }
          changed = true;
        } else {
          p.options[i].votes.delete(btn.user.id);
        }
      }
      if (changed) await msg.edit({ embeds: [buildPollEmbed(p)], components: buildPollRows(p, pid) });
    });

    collector.on('end', async () => {
      const p = store.polls.get(pollId);
      if (!p) return;
      await msg.edit({ embeds: [buildPollEmbed(p)], components: buildPollRows(p, pollId, true) }).catch(() => {});
    });
  },
};
