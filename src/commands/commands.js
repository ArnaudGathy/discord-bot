import info from '../../package.json'
import { type } from "os";
import { getRandomGif } from '../utils/giphy';
import { jdrChannel } from '../constants/channels'
import { filter } from 'ramda'

const commandsToIgnore = ['mjroll']

const generateRollMessage = (roll, defaultMessage, author) => {
  let message
  if(roll === 1) {
    message = `${author}: 1 - ÉCHEC CRITIQUE !`
  } else if(roll === 20) {
    message = `${author}: 20 - SUCCÈS CRITIQUE !`
  } else {
    message = defaultMessage
  }
  return message
}

const getSuccessRate = (roll) => {
  if(roll <= 0) {
    return 'échec critique'
  }
  if(roll >= 1 && roll <= 5) {
    return 'échec'
  }
  if(roll >= 6 && roll <= 10) {
    return 'succès partiel'
  }
  if(roll >= 11 && roll <= 15) {
    return 'succès'
  }
  if(roll >= 16 && roll <= 22) {
    return 'succès critique'
  }
  if(roll >= 23 ) {
    return 'succès héroique'
  }
}

export const commands = {
  help: {
    action: ({msg}) =>
      msg.channel.send(
        `# Commandes disponibles\n${Object.entries(filter(command => command.info, commands))
          .map(([key, value]) => `* !${key} - ${value.info}`)
          .join('\n')}`,
        {code: 'markdown'}
      ),
    info: 'Affiche la liste des commandes',
  },
  ping: {
    action: ({msg}) => msg.channel.send('pong'),
    info: 'Test la présence du bot avec un ping -> pong',
  },
  info: {
    action: ({msg}) =>
      msg.channel.send(
        `Nom: ${info.name}\nDescription: ${info.description}\nVersion : ${
          info.version
        }\nAuteur: ${info.author}\nGithub: ${
          info.homepage
        }\nRunning in ${process.env.NODE_ENV} environment on ${type()}`,
        {code: 'markdown'}
      ),
    info: 'Informations sur le bot',
  },
  hello: {
    action: ({msg}) => msg.channel.send(`Kikoo ${msg.author} ( ͡° ͜ʖ ͡°)`),
    info: 'Dites bonjour au bot !',
  },
  gif: {
    action: async ({msg, params}) => msg.channel.send(await getRandomGif(params)),
    info: 'Renvoie un gif random associé au mot clé unique fourni (!gif <mot_clé>)'
  },
  random: {
    action: ({msg}) => msg.reply(`ton random : ${Math.floor((Math.random() * 100) + 1)}`),
    info: 'Renvoie un random entre 1 et 100'
  },
  roll: {
    action: ({msg, params}) => {
      const roll = Math.round(Math.floor(Math.random() * Math.floor(20) + 1))
      const fullRoll = Math.round(roll + parseInt(params, 10))
      const defaultMessage = params ? `${msg.author}: ${roll} (jet) + ${params} (stats) = ${fullRoll} (${getSuccessRate(fullRoll)})` : `${msg.author}: ${roll} (${getSuccessRate(fullRoll)})`
      const message = generateRollMessage(roll, defaultMessage, msg.author)
      msg.channel.send(message)
    },
    info: 'Renvoie un jet de dé 20 associé à une statistique : /roll <statistique>. Pour faire un jet "vide" tapez juste /roll'
  },
  mjroll: {
    action: ({msg, params, client}) => {
      const roll = Math.round(Math.floor(Math.random() * Math.floor(20) + 1))
      const fullRoll = params ? Math.round(roll + parseInt(params, 10)) : roll
      const defaultMessage = `${msg.author}: ${fullRoll} (${getSuccessRate(fullRoll)})`
      const message = generateRollMessage(roll, defaultMessage, msg.author)
      client.channels.get(jdrChannel).sendmessage()
    },
  }
}

export const fallback = async ({msg, command}) => {
  const gif = await getRandomGif('cry')
  const channel = await msg.author.createDM()
  channel.send(`Pas de commande associée à **${command}**\n${gif}`)
}
