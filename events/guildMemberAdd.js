const { Events, EmbedBuilder } = require('discord.js');
const { store } = require('../utils/store');

module.exports = {
  name: aEvents.GuildMemberAdd,
  async execute(member, client) {
    const guildId = member.guild.id;

    // ── Auto-role ──
    const autoRoles = store.autoRoles.get(guildId) || [];
    for (const roleId of autoRoles) {
      const role = member.guild.roles.cache.get(roleId);
      if (role) await member.roles.add(role).catch(console.error);
    }

    // ── Welcome message ──
    const wc = store.welcomeConfig.get(guildId);
    if (!wc) return;
    const channel = member.guild.channels.cache.get(wc.channelId);
    if (!channel) return;

    const msg = wc.message
      .replace('{user}', `<@${member.id}>`)
      .replace('{server}', member.guild.name)
      .replace('{memberCount}', member.guild.memberCount);

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle(`👋 Welcome to ${member.guild.name}!`)
          .setDescription(msg)
          .setThumbnail(member.user.displayAvatarURL())
          .setFooter({ text: `Member #${member.guild.memberCount}` })
          .setTimestamp(),
      ],
    }).catch(console.error);
  },
};
