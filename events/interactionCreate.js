const { Events, Collection } = require('discord.js');
const { errorEmbed } = require('../utils/helpers');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Cooldown handling
    const { cooldowns } = client;
    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cooldownAmount = (command.cooldown ?? 3) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expireTime = timestamps.get(interaction.user.id) + cooldownAmount;
      if (now < expireTime) {
        const left = ((expireTime - now) / 1000).toFixed(1);
        return interaction.reply({
          embeds: [errorEmbed(`Please wait **${left}s** before using \`/${command.data.name}\` again.`, 'Cooldown')],
          ephemeral: true,
        });
      }
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(`Error in /${command.data.name}:`, err);
      const reply = { embeds: [errorEmbed('An error occurred while running this command.')], ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};
