const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { store, nextId } = require('../utils/store');
const { parseDuration, formatDuration, errorEmbed, successEmbed } = require('../utils/helpers');

function buildGiveawayEmbed(giveaway, ended = false) {
  const embed = new EmbedBuilder()
    .setColor(ended ? 0x95a5a6 : 0xf1c40f)
    .setTitle(`🎉 GIVEAWAY${ended ? ' (ENDED)' : ''}`)
    .addFields(
      { name: '🎁 Prize', value: giveaway.prize, inline: true },
      { name: '👥 Entries', value: `${giveaway.entries.size}`, inline: true },
      { name: '🏁 Ends', value: ended ? 'Ended' : `<t:${Math.floor(giveaway.endsAt / 1000)}:R>`, inline: true },
      { name: '🎟️ Host', value: `<@${giveaway.hostId}>`, inline: true },
    )
    .setFooter({ text: ended ? 'Giveaway ended' : 'Click the button below to enter!' })
    .setTimestamp();
  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Manage giveaways')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(s =>
      s.setName('start').setDescription('Start a giveaway')
        .addStringOption(o => o.setName('prize').setDescription('What are you giving away?').setRequired(true))
        .addStringOption(o => o.setName('duration').setDescription('Duration (e.g. 10m, 1h, 1d)').setRequired(true))
        .addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(10).setRequired(false)))
    .addSubcommand(s =>
      s.setName('end').setDescription('End a giveaway early')
        .addStringOption(o => o.setName('message_id').setDescription('The giveaway message ID').setRequired(true)))
    .addSubcommand(s =>
      s.setName('reroll').setDescription('Reroll a giveaway winner')
        .addStringOption(o => o.setName('message_id').setDescription('The giveaway message ID').setRequired(true))),
  cooldown: 5,

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'start') {
      const prize = interaction.options.getString('prize');
      const durationStr = interaction.options.getString('duration');
      const winners = interaction.options.getInteger('winners') || 1;
      const ms = parseDuration(durationStr);
      if (!ms) return interaction.reply({ embeds: [errorEmbed('Invalid duration.')], ephemeral: true });

      const giveaway = {
        prize,
        hostId: interaction.user.id,
        channelId: interaction.channelId,
        endsAt: Date.now() + ms,
        entries: new Set(),
        winners,
      };

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('giveaway_enter').setLabel('🎉 Enter').setStyle(ButtonStyle.Success),
      );

      const msg = await interaction.reply({ embeds: [buildGiveawayEmbed(giveaway)], components: [row], fetchReply: true });
      giveaway.messageId = msg.id;
      store.giveaways.set(msg.id, giveaway);

      const collector = msg.createMessageComponentCollector({ time: ms });
      collector.on('collect', async btn => {
        if (btn.customId !== 'giveaway_enter') return;
        const g = store.giveaways.get(msg.id);
        if (!g) return;
        if (g.entries.has(btn.user.id)) {
          g.entries.delete(btn.user.id);
          await btn.reply({ content: '❌ You have left the giveaway.', ephemeral: true });
        } else {
          g.entries.add(btn.user.id);
          await btn.reply({ content: '✅ You have entered the giveaway! Good luck!', ephemeral: true });
        }
        await msg.edit({ embeds: [buildGiveawayEmbed(g)] }).catch(() => {});
      });

      collector.on('end', async () => {
        const g = store.giveaways.get(msg.id);
        if (!g) return;
        const entries = [...g.entries];
        const winnerCount = Math.min(g.winners, entries.length);
        const winnerIds = [];
        const shuffled = entries.sort(() => Math.random() - 0.5);
        for (let i = 0; i < winnerCount; i++) winnerIds.push(shuffled[i]);

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('giveaway_enter').setLabel('🎉 Ended').setStyle(ButtonStyle.Secondary).setDisabled(true),
        );
        await msg.edit({ embeds: [buildGiveawayEmbed(g, true)], components: [disabledRow] }).catch(() => {});

        const channel = client.channels.cache.get(g.channelId);
        if (!channel) return;

        if (winnerIds.length === 0) {
          channel.send({ embeds: [new EmbedBuilder().setColor(0xe74c3c).setDescription('🎉 Giveaway ended but no one entered!')] });
        } else {
          channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0xf1c40f)
                .setTitle('🎉 Giveaway Ended!')
                .addFields(
                  { name: '🎁 Prize', value: g.prize },
                  { name: '🏆 Winner(s)', value: winnerIds.map(id => `<@${id}>`).join(', ') },
                )
                .setTimestamp(),
            ],
            content: winnerIds.map(id => `<@${id}>`).join(', '),
          });
        }
      });
    }

    if (sub === 'end') {
      const msgId = interaction.options.getString('message_id');
      const g = store.giveaways.get(msgId);
      if (!g) return interaction.reply({ embeds: [errorEmbed('Giveaway not found.')], ephemeral: true });
      g.endsAt = Date.now();
      await interaction.reply({ embeds: [successEmbed('Giveaway ended early.')] });
    }

    if (sub === 'reroll') {
      const msgId = interaction.options.getString('message_id');
      const g = store.giveaways.get(msgId);
      if (!g) return interaction.reply({ embeds: [errorEmbed('Giveaway not found.')], ephemeral: true });
      const entries = [...g.entries];
      if (entries.length === 0) return interaction.reply({ embeds: [errorEmbed('No entries to reroll.')], ephemeral: true });
      const winner = entries[Math.floor(Math.random() * entries.length)];
      await interaction.reply({ embeds: [successEmbed(`🎉 New winner: <@${winner}>!`)] });
    }
  },
};
