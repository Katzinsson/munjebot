'use strict';

const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { channelId } = require('../config');

const DATA_PATH = path.join(__dirname, '../../data/leaderboard.json');

// ─── READ ───
function readData() {
  if (!fs.existsSync(DATA_PATH)) return {};
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

// ─── WRITE ───
function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ─── SUM ALL NUMBERS ───
function extractNumbers(text) {
  const matches = text.match(/\d+/g);
  if (!matches) return 0;

  let sum = 0;

  for (const n of matches) {
    const num = Number(n);
    if (num >= 1 && num <= 10000000) {
      sum += num;
    }
  }

  return sum;
}

// ─── EVENT ───
module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;
    if (message.channelId !== channelId) return;

    const value = extractNumbers(message.content);
    if (!value) return;

    const data = readData();
    const userId = message.author.id;

    if (!data[userId]) {
      data[userId] = {
        name: message.member?.displayName || message.author.username,
        score: 0
      };
    }

    data[userId].name = message.member?.displayName || message.author.username;
    data[userId].score += value;

    writeData(data);

    try {
      await message.react('✅');
    } catch {}
  }
};