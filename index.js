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
const token = process.env.DISCORD_BOT_TOKEN;


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// ─── COMMAND HANDLER ─────────────────────────────
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// ─── EVENTS ─────────────────────────────
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// ─── INTERACTIONS (FIXED ANTI DOUBLE REPLY) ─────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ Command Error /${interaction.commandName}:`, err);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: '❌ Fehler beim Ausführen des Commands.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ Fehler beim Ausführen des Commands.',
          ephemeral: true
        });
      }
    } catch (e) {
      console.error('❌ Reply Error:', e);
    }
  }
});

// ─── READY ─────────────────────────────
client.once('ready', () => {
  console.log(`🤖 Bot online als ${client.user.tag}`);
});

// ─── LOGIN ─────────────────────────────
client.login(token)
  .then(() => console.log('✅ Login erfolgreich'))
  .catch(err => console.error('❌ Login Fehler:', err));