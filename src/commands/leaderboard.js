const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const filePath = path.join(__dirname, '../../data/leaderboard.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Zeigt die Rangliste'),

  async execute(interaction) {
    let data = {};

    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const sorted = Object.entries(data)
      .sort((a, b) => b[1].score - a[1].score);

    if (!sorted.length) {
      return interaction.reply({
        content: '❌ Keine Daten vorhanden.',
        ephemeral: true
      });
    }

    let description = '';

    sorted.slice(0, 10).forEach((user, index) => {
      const name = user[1]?.name || 'Unknown';
      const score = user[1]?.score || 0;

      let medal = '';
      if (index === 0) medal = '🥇';
      else if (index === 1) medal = '🥈';
      else if (index === 2) medal = '🥉';
      else medal = `#${index + 1}`;

      description += `**${medal} ${name}** — \`${score}\`\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle('🏆 RANG LISTA')
      .setColor(0x00ffcc)
      .setDescription(description)
      .setFooter({ text: 'Munje Bot Leaderboard ⚡' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};