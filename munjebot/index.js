'use strict';

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials
} = require('discord.js');

const { token } = require('./src/config');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ─── COMMANDS ────────────────────────────────────────────────────────────────

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file =>
  file.endsWith('.js')
);

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// ─── EVENTS ──────────────────────────────────────────────────────────────────

const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file =>
  file.endsWith('.js')
);

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// ─── SLASH COMMANDS HANDLER ─────────────────────────────────────────────────

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ Fehler bei /${interaction.commandName}:`, err);

    try {
      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ Fehler beim Ausführen des Befehls.'
        });
      } else if (!interaction.replied) {
        await interaction.reply({
          content: '❌ Fehler beim Ausführen des Befehls.',
          ephemeral: true
        });
      }
    } catch (e) {
      console.error('❌ Reply Fehler:', e);
    }
  }
});

// ─── WEEKLY RESET (SONNTAG 23:59 DE/BOSNIEN ZEIT) ───────────────────────────

const leaderboardPath = path.join(__dirname, 'data', 'leaderboard.json');

let lastResetWeek = null;

function isSunday2359GermanTime() {
  const now = new Date();

  // UTC -> Deutschland/Bosnien (CET/CEST) ≈ +1/+2 Stunden
  const german = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));

  const day = german.getDay(); // 0 = Sunday
  const hour = german.getHours();
  const minute = german.getMinutes();

  const weekKey = `${german.getFullYear()}-${german.getWeek?.() || ''}`;

  return {
    trigger: day === 0 && hour === 23 && minute === 59,
    weekKey
  };
}

setInterval(() => {
  try {
    const now = new Date();
    const german = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));

    const isResetTime = german.getDay() === 0 &&
      german.getHours() === 23 &&
      german.getMinutes() === 59;

    const weekId = `${german.getFullYear()}-${german.getMonth()}-${german.getDate()}`;

    if (!isResetTime) return;
    if (lastResetWeek === weekId) return;

    if (!fs.existsSync(leaderboardPath)) return;

    const data = JSON.parse(fs.readFileSync(leaderboardPath, 'utf8'));

    for (const userId in data) {
      data[userId].score = 0;
    }

    fs.writeFileSync(leaderboardPath, JSON.stringify(data, null, 2));

    lastResetWeek = weekId;

    console.log('🔄 Weekly leaderboard reset (Sonntag 23:59)');
  } catch (err) {
    console.error('❌ Reset Fehler:', err);
  }
}, 60 * 1000);

// ─── READY ───────────────────────────────────────────────────────────────────

client.once('ready', () => {
  console.log(`✅ Bot online als ${client.user.tag}`);
});

// ─── LOGIN ───────────────────────────────────────────────────────────────────

client.login(token)
  .then(() => console.log('🤖 Login erfolgreich'))
  .catch(err => console.error('❌ Login Fehler:', err));