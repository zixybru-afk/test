const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption(o => o.setName('user').setDescription('The user').setRequired(false)),
  cooldown: 5,

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const sizes = [128, 256, 512, 1024, 2048, 4096];
    const url = user.displayAvatarURL({ size: 4096 });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`🖼️ ${user.tag}'s Avatar`)
      .setImage(url)
      .setFooter({ text: `Links: ${sizes.map(s => `[${s}](${user.displayAvatarURL({ size: s })})`).join(' | ')}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Open Full Size').setStyle(ButtonStyle.Link).setURL(url),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
