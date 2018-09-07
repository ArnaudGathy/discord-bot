import Discord from 'discord.js'
import { messageHandler } from './events/message';
import {token} from '../token'


// Setup discord client
export const client = new Discord.Client()
client.login(token)

client.on('ready', () => {
  console.log('Connected')
  console.log(`Logged in as ${client.user.tag}`)
});

client.on('message', messageHandler)