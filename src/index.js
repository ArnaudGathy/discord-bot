import Discord from 'discord.js'
import { messageHandler } from './events/message';
import auth from './constants/auth'
import { channels } from './constants/channels';

require('dotenv').config()

export const client = new Discord.Client()
client.login(auth.token.discord)

client.on('ready', () => {
  if(process.env.NODE_ENV === 'production') {
    client.channels.get(channels['test_bot']).send(`Running on ${process.env.COMPUTERNAME} with ${process.env.OS}`)
  } else {
    console.log('Connected')
    console.log(`Logged in as ${client.user.tag}`)
  }
});

client.on('message', messageHandler)