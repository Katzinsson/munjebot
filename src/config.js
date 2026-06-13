require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_BOT_TOKEN,
  guildId: process.env.DISCORD_GUILD_ID,
  channelId: process.env.DISCORD_CHANNEL_ID,
  clientId: process.env.DISCORD_CLIENT_ID
};