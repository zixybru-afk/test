/**
 * In-memory store — survives the process lifetime (no database needed).
 * All data resets when the bot restarts.
 */

const store = {
  warnings: new Map(),    // guildId -> Map<userId, [{reason, moderator, timestamp}]>
  xp: new Map(),          // guildId -> Map<userId, {xp, level, lastMessage}>
  polls: new Map(),        // pollId -> {question, options:[{label,votes:Set<userId>}], channelId, messageId, creatorId, endsAt}
  afk: new Map(),          // userId -> {reason, since}
  reminders: new Map(),    // userId -> [{id, message, fireAt, channelId}]
  giveaways: new Map(),    // messageId -> {prize, hostId, channelId, endsAt, entries:Set<userId>}
  tags: new Map(),         // guildId -> Map<tagName, {content, creatorId, uses}>
  slowmodes: new Map(),    // channelId -> {delay, setBy}
  autoRoles: new Map(),    // guildId -> roleId[]
  welcomeConfig: new Map(),// guildId -> {channelId, message}
  noteCounters: new Map(), // to generate unique IDs
};

function getWarnings(guildId, userId) {
  if (!store.warnings.has(guildId)) store.warnings.set(guildId, new Map());
  const gMap = store.warnings.get(guildId);
  if (!gMap.has(userId)) gMap.set(userId, []);
  return gMap.get(userId);
}

function addWarning(guildId, userId, reason, moderatorId) {
  const warns = getWarnings(guildId, userId);
  warns.push({ reason, moderatorId, timestamp: Date.now() });
  return warns.length;
}

function clearWarnings(guildId, userId) {
  if (!store.warnings.has(guildId)) return 0;
  const gMap = store.warnings.get(guildId);
  const count = (gMap.get(userId) || []).length;
  gMap.set(userId, []);
  return count;
}

function getXP(guildId, userId) {
  if (!store.xp.has(guildId)) store.xp.set(guildId, new Map());
  const gMap = store.xp.get(guildId);
  if (!gMap.has(userId)) gMap.set(userId, { xp: 0, level: 0, lastMessage: 0 });
  return gMap.get(userId);
}

function addXP(guildId, userId, amount) {
  const data = getXP(guildId, userId);
  data.xp += amount;
  const newLevel = Math.floor(0.1 * Math.sqrt(data.xp));
  const leveledUp = newLevel > data.level;
  data.level = newLevel;
  return { ...data, leveledUp };
}

function getLeaderboard(guildId, limit = 10) {
  if (!store.xp.has(guildId)) return [];
  return [...store.xp.get(guildId).entries()]
    .sort((a, b) => b[1].xp - a[1].xp)
    .slice(0, limit)
    .map(([userId, data]) => ({ userId, ...data }));
}

function getTag(guildId, name) {
  if (!store.tags.has(guildId)) return null;
  return store.tags.get(guildId).get(name.toLowerCase()) || null;
}

function setTag(guildId, name, content, creatorId) {
  if (!store.tags.has(guildId)) store.tags.set(guildId, new Map());
  store.tags.get(guildId).set(name.toLowerCase(), { content, creatorId, uses: 0 });
}

function deleteTag(guildId, name) {
  if (!store.tags.has(guildId)) return false;
  return store.tags.get(guildId).delete(name.toLowerCase());
}

function listTags(guildId) {
  if (!store.tags.has(guildId)) return [];
  return [...store.tags.get(guildId).entries()].map(([name, data]) => ({ name, ...data }));
}

function nextId(type) {
  const cur = store.noteCounters.get(type) || 0;
  store.noteCounters.set(type, cur + 1);
  return `${type}-${cur + 1}`;
}

module.exports = {
  store,
  getWarnings,
  addWarning,
  clearWarnings,
  getXP,
  addXP,
  getLeaderboard,
  getTag,
  setTag,
  deleteTag,
  listTags,
  nextId,
};
