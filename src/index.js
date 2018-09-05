import Discord from 'discord.js'
import winston from 'winston'
import {auth} from './auth/auth'
import { messageHandler } from './events/message';

// Configure logger settings
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console()
  ]
})

// Setup discord client
export const client = new Discord.Client()
auth.login()

client.on('ready', () => {
  logger.info('Connected')
  logger.info(`Logged in as ${client.user.tag}`)
});

client.on('message', messageHandler)