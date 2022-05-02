require('dotenv').config()
import Discord from 'discord.js'
import {messageHandler} from './events/message'
import auth from './constants/auth'
import {channels} from './constants/channels'

export const client = new Discord.Client({intents : [
  Discord.Intents.FLAGS.GUILDS,
  Discord.Intents.FLAGS.GUILD_MESSAGES,
  Discord.Intents.FLAGS.DIRECT_MESSAGES,
]}, {
  ws: {
    intents: [
      Discord.Intents.GUILDS,
      Discord.Intents.GUILD_MEMBERS,
      Discord.Intents.GUILD_INVITES,
      Discord.Intents.GUILD_VOICE_STATES,
      Discord.Intents.GUILD_PRESENCES,
      Discord.Intents.GUILD_MESSAGES,
      Discord.Intents.GUILD_MESSAGE_REACTIONS,
      Discord.Intents.GUILD_MESSAGE_TYPING,
      Discord.Intents.DIRECT_MESSAGES,
      Discord.Intents.DIRECT_MESSAGE_REACTIONS,
      Discord.Intents.DIRECT_MESSAGE_TYPING,
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
