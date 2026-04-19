const { ActivityType } = require('discord.js');

const statuses = [
  { name: '/help | Advanced Bot', type: ActivityType.Watching },
  { name: 'your server', type: ActivityType.Watching },
  { name: 'with slash commands', type: ActivityType.Playing },
];

let statusIndex = 0;

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📡 Serving ${client.guilds.cache.size} guild(s)`);

    function rotate() {
      const s = statuses[statusIndex % statuses.length];
      client.user.setActivity(s.name, { type: s.type });
      statusIndex++;
    }
    rotate();
    setInterval(rotate, 30_000);
  },
};
