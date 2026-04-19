const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription("Get a user's profile banner")
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(false)),
  cooldown: 5,

  async execute(interaction) {
    const user = await interaction.client.users.fetch(
      (interaction.options.getUser('user') || interaction.user).id,
      { force: true }
    );

    if (!user.banner) {
      return interaction.reply({ content: `**${user.tag}** has no banner set.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🖼️ ${user.tag}'s Banner`)
      .setImage(user.bannerURL({ size: 4096 }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
