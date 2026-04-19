const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about this server'),
  cooldown: 5,

  async execute(interaction) {
    const { guild } = interaction;
    await guild.fetch();

    const channels = guild.channels.cache;
    const text = channels.filter(c => c.type === 0).size;
    const voice = channels.filter(c => c.type === 2).size;
    const categories = channels.filter(c => c.type === 4).size;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: 'Members', value: `👥 ${guild.memberCount}`, inline: true },
        { name: 'Roles', value: `🎭 ${guild.roles.cache.size}`, inline: true },
        { name: 'Emojis', value: `😄 ${guild.emojis.cache.size}`, inline: true },
        { name: 'Channels', value: `📝 Text: ${text} | 🔊 Voice: ${voice} | 📁 Categories: ${categories}`, inline: false },
        { name: 'Boost Level', value: `Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true },
        { name: 'Verification', value: guild.verificationLevel.toString(), inline: true },
      )
      .setImage(guild.bannerURL({ size: 1024 }) || null)
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
