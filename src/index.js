require('dotenv').config()
import {runCrons} from './cron'
import Discord from 'discord.js'
import { messageHandler } from './events/message';
import auth from './constants/auth'
import { channels } from './constants/channels';

export const client = new Discord.Client()
client.login(auth.token.discord)

client.on('ready', () => {
  if(process.env.NODE_ENV === 'production') {
    client.channels.get(channels['test_bot']).send(`Running in ${process.env.NODE_ENV} 👌🔥`)
  } else {
    console.log('Connected')
    console.log(`Logged in as ${client.user.tag}`)
  }
});

client.on('message', msg => messageHandler(msg, client))

runCrons(client)