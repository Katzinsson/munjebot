require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const { token, clientId, guildId } = require('./src/config');

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🔄 Deploying slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log('✅ Slash commands deployed successfully!');
  } catch (error) {
    console.error('❌ Deploy error:', error);
  }
})();