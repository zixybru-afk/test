const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1-100)').setMinValue(1).setMaxValue(100).setRequired(true))
    .addUserOption(o => o.setName('user').setDescription('Only delete messages from this user').setRequired(false)),
  cooldown: 5,

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const filterUser = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    let messages = await interaction.channel.messages.fetch({ limit: 100 });
    if (filterUser) messages = messages.filter(m => m.author.id === filterUser.id);
    messages = [...messages.values()].slice(0, amount);

    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const deletable = messages.filter(m => m.createdTimestamp > twoWeeksAgo);

    if (deletable.length === 0) {
      return interaction.editReply({ embeds: [errorEmbed('No messages found to delete (messages older than 14 days cannot be bulk deleted).')] });
    }

    const deleted = await interaction.channel.bulkDelete(deletable, true);
    await interaction.editReply({ embeds: [successEmbed(`Deleted **${deleted.size}** message(s)${filterUser ? ` from **${filterUser.tag}**` : ''}.`)] });
  },
};
