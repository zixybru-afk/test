const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const facts = [
  'Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.',
  "A group of flamingos is called a 'flamboyance'.",
  'Octopuses have three hearts and blue blood.',
  'The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.',
  'Bananas are berries, but strawberries are not.',
  'A day on Venus is longer than a year on Venus.',
  'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.',
  'The fingerprints of a koala are virtually indistinguishable from human fingerprints.',
  'There are more trees on Earth than stars in the Milky Way.',
  'The first computer bug was an actual bug — a moth found inside a Harvard Mark II computer in 1947.',
  'A bolt of lightning contains enough energy to toast 100,000 slices of bread.',
  'Sharks are older than trees. Sharks have existed for about 450 million years, trees for about 350 million.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Get a random interesting fact'),
  cooldown: 3,

  async execute(interaction) {
    const fact = facts[Math.floor(Math.random() * facts.length)];
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('💡 Random Fact')
      .setDescription(fact)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
