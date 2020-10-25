import info from '../../package.json'
import {type} from "os";
import { getRandomGif } from '../utils/giphy';

const commandsToIgnore = ['mjroll']

export const commands = {
  help: {
    action: ({msg}) =>
      msg.channel.send(
        `# Commandes disponibles\n${Object.entries(commands.filter(command => !command['mjroll']))
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
      const roll = Math.floor(Math.round((Math.random() * 100) + 1) / 5)
      const message = params ? `${msg.author}: ${roll} + ${params} = ${Math.round(roll + params)}` : `${msg.author}: ${roll}`
      msg.channel.send(message)
    },
    infi: 'Renvoie un jet de dé 20 associé à une statistique (/roll <statistique>)'
  }
}

export const fallback = async ({msg, command}) => {
  const gif = await getRandomGif('cry')
  const channel = await msg.author.createDM()
  channel.send(`Pas de commande associée à **${command}**\n${gif}`)
}
