# Advanced Discord Bot

A fully-featured Discord bot in pure JavaScript using **discord.js v14**.  
**No database required** — all data is stored in memory (resets on restart).

---

## Features

### 🛡️ Moderation
| Command | Description |
|---------|-------------|
| `/ban` | Ban a member with optional message deletion |
| `/kick` | Kick a member |
| `/warn` | Warn a member (stored in memory) |
| `/warnings` | View all warnings for a user |
| `/clearwarns` | Clear all warnings for a user |
| `/timeout` | Timeout a member (10s, 5m, 2h, 1d, etc.) |
| `/purge` | Bulk delete up to 100 messages |
| `/slowmode` | Set channel slowmode (0 to disable) |
| `/lock` | Lock a channel (no one can send messages) |
| `/unlock` | Unlock a locked channel |

### 📊 Leveling / XP
| Command | Description |
|---------|-------------|
| `/rank` | View your XP, level, and rank |
| `/leaderboard` | Server XP leaderboard (paginated) |

XP is earned by chatting (15–25 XP per message, 1-minute cooldown).

### 🔧 Utility
| Command | Description |
|---------|-------------|
| `/ping` | Bot latency and API ping |
| `/userinfo` | Detailed info about a user |
| `/serverinfo` | Detailed info about the server |
| `/avatar` | Get a user's avatar |
| `/banner` | Get a user's profile banner |
| `/roleinfo` | Info about a role |
| `/afk` | Set AFK status (auto-notifies when mentioned) |
| `/remind` | Set a reminder (up to 7 days) |
| `/poll` | Create an interactive button poll |
| `/tag` | Create/use/delete custom text tags |
| `/giveaway` | Host giveaways with button entry |
| `/welcome` | Configure welcome messages |
| `/autorole` | Auto-assign roles to new members |
| `/help` | List all commands |

### 🎉 Fun & Games
| Command | Description |
|---------|-------------|
| `/8ball` | Magic 8-ball |
| `/coinflip` | Flip a coin |
| `/dice` | Roll any dice (e.g. 2d20) |
| `/rps` | Rock, Paper, Scissors |
| `/meme` | Fetch a meme from Reddit |
| `/joke` | Random joke with spoiler punchline |
| `/fact` | Random interesting fact |
| `/quote` | Inspirational quote |
| `/reverse` | Reverse text |
| `/guess` | Button-based number guessing game |
| `/trivia` | Multiple-choice trivia question |
| `/hangman` | Interactive hangman game |

---

## Setup

### 1. Clone or download this folder
Push the `discord-bot/` folder to your GitHub repo.

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
```bash
cp .env.example .env
```

Fill in your values:
```
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id_here
GUILD_ID=your_guild_id_here_for_testing   # Optional — for instant command deployment
```

**Where to get these:**
- Go to https://discord.com/developers/applications
- Create a new application → Bot section → copy the **Token**
- Copy the **Application ID** (this is your CLIENT_ID)
- Enable all **Privileged Gateway Intents** (Presence, Server Members, Message Content)

### 4. Deploy slash commands
```bash
npm run deploy-commands
```
- With `GUILD_ID` set: commands appear instantly in that server
- Without `GUILD_ID`: global commands (takes up to 1 hour)

### 5. Start the bot
```bash
npm start
```

---

## Hosting on Railway

1. Push to GitHub
2. Create a new Railway project → **Deploy from GitHub repo**
3. Add environment variables in Railway's dashboard:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
4. Railway auto-detects `npm start` as the start command
5. Deploy — the bot will be online 24/7

**Important for Railway:** Run `npm run deploy-commands` once locally (with your token) before deploying, so slash commands are registered globally.

---

## Adding the Bot to Your Server

Use this URL (replace `YOUR_CLIENT_ID`):
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

---

## Notes
- All data (XP, warnings, polls, giveaways, tags) is in-memory and **resets on restart**.
- Cooldowns reset on restart too.
- For persistent data, you would need to add a database (MongoDB, PostgreSQL, SQLite, etc.).
- The meme command fetches from Reddit's public JSON API — no API key needed.
