const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { store, nextId } = require('../utils/store');
const { successEmbed, errorEmbed, parseDuration, formatDuration } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addStringOption(o => o.setName('duration').setDescription('When to remind you (e.g. 10m, 2h, 1d)').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('What to remind you about').setRequired(true)),
  cooldown: 5,

  async execute(interaction) {
    const durationStr = interaction.options.getString('duration');
    const message = interaction.options.getString('message');
    const ms = parseDuration(durationStr);

    if (!ms) return interaction.reply({ embeds: [errorEmbed('Invalid duration. Use formats like `10s`, `5m`, `2h`, `1d`.')], ephemeral: true });
    if (ms > 7 * 24 * 60 * 60 * 1000) return interaction.reply({ embeds: [errorEmbed('Maximum reminder duration is 7 days.')], ephemeral: true });

    const id = nextId('reminder');
    const fireAt = Date.now() + ms;
    const userId = interaction.user.id;
    const channelId = interaction.channelId;

    if (!store.reminders.has(userId)) store.reminders.set(userId, []);
    store.reminders.get(userId).push({ id, message, fireAt, channelId });

    await interaction.reply({
      embeds: [successEmbed(`I'll remind you in **${formatDuration(ms)}**:\n> ${message}`, 'Reminder Set')],
    });

    setTimeout(async () => {
      const reminders = store.reminders.get(userId) || [];
      const idx = reminders.findIndex(r => r.id === id);
      if (idx !== -1) reminders.splice(idx, 1);

      const channel = interaction.client.channels.cache.get(channelId);
      if (channel) {
        await channel.send({
          content: `<@${userId}>`,
          embeds: [
            new EmbedBuilder()
              .setColor(0xf39c12)
              .setTitle('⏰ Reminder!')
              .setDescription(message)
              .setFooter({ text: `Reminder ID: ${id}` })
              .setTimestamp(),
          ],
        }).catch(console.error);
      }
    }, ms);
  },
};
