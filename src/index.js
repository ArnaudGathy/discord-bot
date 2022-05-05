require('dotenv').config()
const { Client, Intents, Collection } = require('discord.js');
const {messageHandler} = require('./events/message')
const auth = require('./constants/auth')
const {channels} = require('./constants/channels')
const fs = require('node:fs')

export const client = new Client({intents : [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGES,
]}, {
  ws: {
    intents: [
      Intents.GUILDS,
      Intents.GUILD_MEMBERS,
      Intents.GUILD_INVITES,
      Intents.GUILD_VOICE_STATES,
      Intents.GUILD_PRESENCES,
      Intents.GUILD_MESSAGES,
      Intents.GUILD_MESSAGE_REACTIONS,
      Intents.GUILD_MESSAGE_TYPING,
      Intents.DIRECT_MESSAGES,
      Intents.DIRECT_MESSAGE_REACTIONS,
      Intents.DIRECT_MESSAGE_TYPING,
    ],
  },
})

client.login(auth.token.discord)

client.on('ready', () => {
  if (process.env.NODE_ENV === 'production') {
    client.channels
      .cache.get(channels['test_bot'])
      .send(`Running in ${process.env.NODE_ENV} 👌🔥`)
  } else {
    console.log('Connected')
    console.log(`Logged in as ${client.user.tag}`)
  }
})

client.on('messageCreate', msg => messageHandler(msg, client))

// Disabled rare spawn announcements
// runCrons(client)


// Register slash commands to client object.
// Note: to register the command you need to run the script `deploy-commands.js`:
// `node ./deploy-commands.js`
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Load register command handler.
for (const file of commandFiles) {
	const command = require(`../commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
  if (command.data) {
    client.commands.set(command.data.name, command);
  }
}

// Listen on slash command
client.on('interactionCreate', async interaction => {
  // Return in case of other bot interaction events
  if (interaction.applicationId !== auth.discord.clientId) return;

	if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Il y a eu une erreur durant l\'éxecution de cette commande.', ephemeral: true });
	}
});
