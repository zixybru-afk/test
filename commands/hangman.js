const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const words = [
  'javascript', 'discord', 'programming', 'keyboard', 'monitor', 'server',
  'algorithm', 'database', 'function', 'variable', 'computer', 'network',
  'developer', 'software', 'terminal', 'protocol', 'library', 'framework',
];

const HANGMAN_STAGES = [
  '```\n  +---+\n      |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  O   |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  O   |\n  |   |\n      |\n      |\n=========```',
  '```\n  +---+\n  O   |\n /|   |\n      |\n      |\n=========```',
  '```\n  +---+\n  O   |\n /|\\  |\n      |\n      |\n=========```',
  '```\n  +---+\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
  '```\n  +---+\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Play a game of hangman'),
  cooldown: 5,

  async execute(interaction) {
    const word = words[Math.floor(Math.random() * words.length)];
    const guessed = new Set();
    let wrong = 0;
    const maxWrong = 6;

    function getDisplay() {
      return word.split('').map(c => (guessed.has(c) ? c : '_')).join(' ');
    }

    function buildEmbed() {
      const display = getDisplay();
      const won = !display.includes('_');
      const lost = wrong >= maxWrong;
      return new EmbedBuilder()
        .setColor(won ? 0x2ecc71 : lost ? 0xe74c3c : 0x3498db)
        .setTitle(won ? '🎉 You Won!' : lost ? '💀 Game Over' : '🪢 Hangman')
        .setDescription(
          `${HANGMAN_STAGES[wrong]}\n` +
          `\`${display}\`\n\n` +
          `Wrong guesses (${wrong}/${maxWrong}): ${[...guessed].filter(c => !word.includes(c)).join(', ') || 'None'}`
        )
        .setFooter({ text: won || lost ? `The word was: ${word}` : 'Click a letter to guess' });
    }

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    function buildRows() {
      const rows = [];
      const chunks = [];
      for (let i = 0; i < alphabet.length; i += 5) chunks.push(alphabet.slice(i, i + 5));
      for (const chunk of chunks.slice(0, 5)) {
        rows.push(new ActionRowBuilder().addComponents(
          chunk.map(c =>
            new ButtonBuilder()
              .setCustomId(`hm_${c}`)
              .setLabel(c.toUpperCase())
              .setStyle(guessed.has(c) ? (word.includes(c) ? ButtonStyle.Success : ButtonStyle.Danger) : ButtonStyle.Secondary)
              .setDisabled(guessed.has(c) || wrong >= maxWrong)
          )
        ));
      }
      return rows;
    }

    const msg = await interaction.reply({ embeds: [buildEmbed()], components: buildRows(), fetchReply: true });

    const collector = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 180_000 });

    collector.on('collect', async btn => {
      const letter = btn.customId.split('_')[1];
      guessed.add(letter);
      if (!word.includes(letter)) wrong++;

      const won = !getDisplay().includes('_');
      const lost = wrong >= maxWrong;

      await btn.update({ embeds: [buildEmbed()], components: buildRows() });

      if (won || lost) collector.stop();
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await msg.edit({
          embeds: [new EmbedBuilder().setColor(0x95a5a6).setTitle('⏰ Game Timed Out').setDescription(`The word was: **${word}**`)],
          components: [],
        }).catch(() => {});
      }
    });
  },
};
