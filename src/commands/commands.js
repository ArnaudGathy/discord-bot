import info from '../../package.json'
import {type} from "os";
import { getRandomGif } from '../utils/giphy';

export const commands = {
  help: {
    action: ({msg}) =>
      msg.channel.send(
        `# Commandes disponibles\n${Object.entries(commands)
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
    info: 'Renvoie un gif random associé au mot clé unique fourni (!gif cry)'
  }
}

export const fallback = async ({msg, command}) => {
  const gif = await getRandomGif('cry')
  const channel = await msg.author.createDM()
  channel.send(`Pas de commande associée à **${command}**\n${gif}`)
}
