const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const filePath = path.join(__dirname, '../../data/leaderboard.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Prikazuje rang listu'),

  async execute(interaction) {
    await interaction.deferReply();

    let data = {};

    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const sorted = Object.entries(data)
      .sort((a, b) => (b[1].score || 0) - (a[1].score || 0));

    if (!sorted.length) {
      return interaction.editReply({
        content: '❌ Nema podataka.'
      });
    }

    let description = '';

    sorted.forEach((user, index) => {
      const name =
        user[1]?.name ||
        user[1]?.username ||
        'Nepoznat';

      const score = user[1]?.score || 0;

      let rank;

      if (index === 0) rank = '🥇';
      else if (index === 1) rank = '🥈';
      else if (index === 2) rank = '🥉';
      else rank = `#${index + 1}`;

      description += `${rank} **${name}** • \`${score.toLocaleString('de-DE')}\`\n`;
    });

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 RANG LISTA')
      .setDescription(description)
      .setFooter({
        text: 'Munje Bot ⚡'
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed]
    });
  }
};