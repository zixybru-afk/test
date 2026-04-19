const { EmbedBuilder } = require('discord.js');

function successEmbed(description, title = 'Success') {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function errorEmbed(description, title = 'Error') {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function infoEmbed(description, title = 'Info') {
  return new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function warnEmbed(description, title = 'Warning') {
  return new EmbedBuilder()
    .setColor(0xf39c12)
    .setTitle(`⚠️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

function parseDuration(str) {
  const regex = /^(\d+)(s|m|h|d)$/i;
  const match = str.match(regex);
  if (!match) return null;
  const n = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * map[unit];
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

function hasModerationPermission(member) {
  return member.permissions.has('ManageMessages') ||
    member.permissions.has('KickMembers') ||
    member.permissions.has('BanMembers') ||
    member.permissions.has('Administrator');
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = {
  successEmbed,
  errorEmbed,
  infoEmbed,
  warnEmbed,
  parseDuration,
  formatDuration,
  hasModerationPermission,
  chunkArray,
  randomInt,
  capitalize,
};
