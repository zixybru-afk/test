const { Events, EmbedBuilder } = require('discord.js');
const { store, addXP, getXP } = require('../utils/store');

const XP_COOLDOWN = 60_000; // 1 minute
const XP_PER_MESSAGE = () => Math.floor(Math.random() * 10) + 15; // 15-25

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    // ── AFK check: if someone pings an AFK user, notify ──
    if (message.mentions.users.size > 0) {
      for (const [id, user] of message.mentions.users) {
        if (store.afk.has(id)) {
          const afkData = store.afk.get(id);
          const since = Math.floor(afkData.since / 1000);
          await message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(0xf39c12)
                .setDescription(`💤 **${user.username}** is AFK: ${afkData.reason}\n*Since <t:${since}:R>*`),
            ],
            allowedMentions: { repliedUser: false },
          });
        }
      }
    }

    // ── Remove AFK status if they send a message ──
    if (store.afk.has(message.author.id)) {
      store.afk.delete(message.author.id);
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setDescription(`👋 Welcome back, ${message.author}! Your AFK status has been removed.`),
        ],
        allowedMentions: { repliedUser: false },
      }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    // ── XP / Leveling ──
    const guildId = message.guild.id;
    const userId = message.author.id;
    const data = getXP(guildId, userId);
    const now = Date.now();

    if (now - data.lastMessage < XP_COOLDOWN) return;
    data.lastMessage = now;

    const { xp, level, leveledUp } = addXP(guildId, userId, XP_PER_MESSAGE());

    if (leveledUp) {
      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x9b59b6)
            .setTitle('🎉 Level Up!')
            .setDescription(`Congrats ${message.author}! You reached **Level ${level}** with **${xp} XP**!`)
            .setThumbnail(message.author.displayAvatarURL()),
        ],
      });
    }
  },
};
