'use strict';

const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`✅ Bot ist online – eingeloggt als ${client.user.tag}`);
  },
};