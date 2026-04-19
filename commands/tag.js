const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTag, setTag, deleteTag, listTags } = require('../utils/store');
const { successEmbed, errorEmbed, infoEmbed } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Manage text tags (custom responses)')
    .addSubcommand(s =>
      s.setName('get').setDescription('Use a tag')
        .addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true)))
    .addSubcommand(s =>
      s.setName('set').setDescription('Create or update a tag')
        .addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true))
        .addStringOption(o => o.setName('content').setDescription('Tag content').setRequired(true)))
    .addSubcommand(s =>
      s.setName('delete').setDescription('Delete a tag')
        .addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List all tags')),
  cooldown: 3,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'get') {
      const name = interaction.options.getString('name');
      const tag = getTag(guildId, name);
      if (!tag) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)], ephemeral: true });
      tag.uses++;
      await interaction.reply({ content: tag.content });
    }

    if (sub === 'set') {
      const name = interaction.options.getString('name');
      const content = interaction.options.getString('content');
      setTag(guildId, name, content, interaction.user.id);
      await interaction.reply({ embeds: [successEmbed(`Tag \`${name}\` has been saved.`)] });
    }

    if (sub === 'delete') {
      const name = interaction.options.getString('name');
      const tag = getTag(guildId, name);
      if (!tag) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)], ephemeral: true });
      if (tag.creatorId !== interaction.user.id && !interaction.member.permissions.has('ManageMessages')) {
        return interaction.reply({ embeds: [errorEmbed("You can only delete your own tags (or have Manage Messages permission).")], ephemeral: true });
      }
      deleteTag(guildId, name);
      await interaction.reply({ embeds: [successEmbed(`Tag \`${name}\` deleted.`)] });
    }

    if (sub === 'list') {
      const tags = listTags(guildId);
      if (tags.length === 0) return interaction.reply({ embeds: [infoEmbed('No tags created yet. Use `/tag set` to create one!')] });
      const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('🏷️ Server Tags')
        .setDescription(tags.map(t => `\`${t.name}\` — ${t.uses} use(s)`).join('\n'))
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  },
};
