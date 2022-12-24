const Gamedig = require('gamedig');
const wait = require('node:timers/promises').setTimeout;
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setinfochannel')
		.setDescription('Set the channel server info updates will be sent in!')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('the channel to put updates into')
				.setRequired(true)),
	async execute(interaction) {
		if (interaction.guild.ownerId !== interaction.user.id) {
			await interaction.reply('Only the server owner can set the info channel.');
			return;
		}

		const channel = interaction.options.getChannel('channel');
		async function sendStatusReports(ip, port) {
			const data = await Gamedig.query({
				type: 'unturned',
				host: ip,
				port: port,
			}).then((state) => {
				return state;
			}).catch(() => {
				return false;
			});
			let serverResponseEmbed;
			if (data) {
				serverResponseEmbed = new EmbedBuilder()
					.setColor(0x29a329)
					.setTitle(`Server info for: ${data.name}`)
					.addFields(
						{ name: 'map', value: data.map },
						{ name: 'online Players', value: (data.players.join(', ')) ? data.players.join(', ') : 'No players online', inline: true },
						{ name: 'max Players', value: data.maxplayers.toString(), inline: true },
						{ name: '\u200B', value: '\u200B' },
					)
					.addFields(
						{ name: 'ip', value: data.connect, inline: true },
						{ name: 'ping', value: data.ping.toString(), inline: true },
					)
					.setTimestamp()
					.setFooter({ text: 'Bot made by juls07#9812' });
			} else {
				serverResponseEmbed = new EmbedBuilder()
					.setColor(0xfeff00)
					.setTitle('Modded is offline');
			}

			channel.send({ embeds: [serverResponseEmbed] });
			await wait(1800000); // 30 minutes
			await sendStatusReports(ip, port);
		}

		sendStatusReports(process.env.SERVER_IP, '27017');
		sendStatusReports(process.env.SERVER_IP, '27015');

		await interaction.reply(`Set Update channel to <#${channel.id}>!`);
	},
};
