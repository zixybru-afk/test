const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { randomInt } = require('../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guess')
    .setDescription('Play a number guessing game (1-100)')
    .addIntegerOption(o => o.setName('max').setDescription('Max number to guess (default 100)').setMinValue(10).setMaxValue(1000).setRequired(false)),
  cooldown: 5,

  async execute(interaction) {
    const max = interaction.options.getInteger('max') || 100;
    const secret = randomInt(1, max);
    let attempts = 0;
    const maxAttempts = 7;
    let low = 1, high = max;

    const getEmbed = (msg, color = 0x3498db) => new EmbedBuilder()
      .setColor(color)
      .setTitle('🔢 Number Guessing Game')
      .setDescription(msg)
      .addFields({ name: 'Range', value: `${low} — ${high}`, inline: true }, { name: 'Attempts left', value: `${maxAttempts - attempts}`, inline: true })
      .setFooter({ text: `Guess by clicking buttons or type a number` });

    const buildButtons = (num) => {
      const step = Math.max(1, Math.floor((high - low) / 4));
      const guesses = [
        Math.max(low, num - step * 2),
        Math.max(low, num - step),
        num,
        Math.min(high, num + step),
        Math.min(high, num + step * 2),
      ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);
      return new ActionRowBuilder().addComponents(
        ...guesses.map(g => new ButtonBuilder().setCustomId(`guess_${g}`).setLabel(`${g}`).setStyle(ButtonStyle.Primary))
      );
    };

    const midpoint = Math.floor((low + high) / 2);
    const msg = await interaction.reply({
      embeds: [getEmbed(`I'm thinking of a number between **1** and **${max}**!\nYou have **${maxAttempts}** attempts.`)],
      components: [buildButtons(midpoint)],
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 120_000 });

    collector.on('collect', async btn => {
      const guess = parseInt(btn.customId.split('_')[1]);
      attempts++;

      if (guess === secret) {
        collector.stop('won');
        return btn.update({
          embeds: [new EmbedBuilder().setColor(0x2ecc71).setTitle('🎉 You Won!').setDescription(`The number was **${secret}**!\nYou guessed it in **${attempts}** attempt(s)!`)],
          components: [],
        });
      }

      if (attempts >= maxAttempts) {
        collector.stop('lost');
        return btn.update({
          embeds: [new EmbedBuilder().setColor(0xe74c3c).setTitle('💀 Game Over').setDescription(`You ran out of attempts!\nThe number was **${secret}**.`)],
          components: [],
        });
      }

      const hint = guess < secret ? 'Too low! Go higher.' : 'Too high! Go lower.';
      if (guess < secret) low = Math.max(low, guess + 1);
      else high = Math.min(high, guess - 1);

      const newMid = Math.floor((low + high) / 2);
      await btn.update({
        embeds: [getEmbed(`${hint}\nYou guessed **${guess}**.`)],
        components: [buildButtons(newMid)],
      });
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await msg.edit({
          embeds: [new EmbedBuilder().setColor(0x95a5a6).setTitle('⏰ Game Timed Out').setDescription(`The number was **${secret}**.`)],
          components: [],
        }).catch(() => {});
      }
    });
  },
};
