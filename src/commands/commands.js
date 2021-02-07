import info from '../../package.json'
import {type} from 'os'
import {getRandomGif} from '../utils/giphy'
import {filter} from 'ramda'
import {channels} from '../constants/channels'
import {excuseCmd, excuseInfo, excuseByUser} from './excuse'

export const commands = {
  help: {
    action: ({msg}) =>
      msg.channel.send(
        `# Commandes disponibles\n${Object.entries(
          filter(command => command.info, commands)
        )
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
        }\nAuteur: ${info.author}\nGithub: ${info.homepage}\nRunning in ${
          process.env.NODE_ENV
        } environment on ${type()}`,
        {code: 'markdown'}
      ),
    info: 'Informations sur le bot',
  },
  hello: {
    action: ({msg}) => msg.channel.send(`Kikoo ${msg.author} ( ͡° ͜ʖ ͡°)`),
    info: 'Dites bonjour au bot !',
  },
  excuse: {
    action: excuseCmd,
    info:
      'Retourne la liste des excuses ou ajoute une excuse au codexcuse: ' +
      excuseInfo,
  },
  excuses: {
    action: excuseCmd,
    info:
      'Retourne la liste des excuses: <!excuses page n°> pour obtenir les autres pages',
  },
  excuseuser: {
    action: excuseByUser,
    info: 'Retourne la liste des excuses de @pseudo: <!excuseuser @pseudo>',
  },
  gif: {
    action: async ({msg, params}) =>
      msg.channel.send(await getRandomGif(params)),
    info:
      'Renvoie un gif random associé au mot clé unique fourni (!gif <mot_clé>)',
  },
  random: {
    action: ({msg}) =>
      msg.reply(`ton random : ${Math.floor(Math.random() * 100 + 1)}`),
    info: 'Renvoie un random entre 1 et 100',
  },
  roll: {
    action: ({msg, params}) => {
      const roll = Math.round(Math.floor(Math.random() * Math.floor(20) + 1))
      const fullRoll = Math.round(roll + parseInt(params, 10))
      const defaultMessage = params
        ? `${
            msg.author
          } : ${roll} (jet) + ${params} (stats) = ${fullRoll} (${getSuccessRate(
            fullRoll
          )})`
        : `${msg.author} : ${roll} (${getSuccessRate(roll)})`
      const message = generateRollMessage(roll, defaultMessage, msg.author)
      msg.channel.send(message)
    },
    info:
      'Renvoie un jet de dé 20 associé à une statistique : !roll <statistique>. Pour faire un jet "vide" tapez juste !roll',
  },
  loc: {
    action: ({msg}) => {
      const roll = Math.floor(Math.random() * 100 + 1)
      const message = getLocalisationMessage(roll, msg.author)
      msg.channel.send(message)
    },
    info: 'Renvoie un jet de dé 100 (1 à 100) avec la localisation associée',
  },
  mjroll: {
    action: ({msg, params, client}) => {
      const roll = Math.round(Math.floor(Math.random() * Math.floor(20) + 1))
      const fullRoll = params ? Math.round(roll + parseInt(params, 10)) : roll
      const defaultMessage = `${
        msg.author
      } - Maître du jeu : ${fullRoll} (${getSuccessRate(fullRoll)})`
      const message = generateRollMessage(
        roll,
        defaultMessage,
        msg.author,
        true
      )
      client.channels.get(channels.jdrChannel).send(message)
    },
  },
  mjtriche: {
    action: ({msg, params, client}) => {
      const roll =
        parseInt(params, 10) ||
        Math.round(Math.floor(Math.random() * Math.floor(20) + 1))
      const defaultMessage = `${
        msg.author
      } - Maître du jeu : ${roll} (${getSuccessRate(roll)})`
      const message = generateRollMessage(
        roll,
        defaultMessage,
        msg.author,
        true
      )
      client.channels.get(channels.jdrChannel).send(message)
    },
  },
}

export const fallback = async ({msg, command}) => {
  const gif = await getRandomGif('cry')
  const channel = await msg.author.createDM()
  channel.send(`Pas de commande associée à **${command}**\n${gif}`)
}

const generateRollMessage = (roll, defaultMessage, author, isGm = false) => {
  const authorName = `${author}${isGm ? ' - Maître du jeu' : ''}`
  let message
  if (roll === 1) {
    message = `${authorName} : 1 - ÉCHEC CRITIQUE !`
  } else if (roll === 20) {
    message = `${authorName} : 20 - SUCCÈS CRITIQUE !`
  } else {
    message = defaultMessage
  }
  return message
}

const getSuccessRate = roll => {
  if (roll <= 0) {
    return 'échec critique'
  }
  if (roll >= 1 && roll <= 5) {
    return 'échec'
  }
  if (roll >= 6 && roll <= 10) {
    return 'succès partiel'
  }
  if (roll >= 11 && roll <= 15) {
    return 'succès'
  }
  if (roll >= 16 && roll <= 22) {
    return 'succès critique'
  }
  if (roll >= 23) {
    return 'succès héroique'
  }
}

const localisations = [
  {
    min: 1,
    max: 1,
    value: 'Pied droit',
    effect:
      "-3 aux jets de parade et d'esquive + réduction de l'allure de 2m/round",
  },
  {
    min: 2,
    max: 2,
    value: 'Pied gauche',
    effect:
      "-3 aux jets de parade et d'esquive + réduction de l'allure de 2m/round",
  },
  {
    min: 3,
    max: 7,
    value: 'Tibia droit',
    effect: 'Peut renverser en cas du succès critique',
  },
  {min: 8, max: 8, value: 'Genoux droit', effect: 'Voir règles'},
  {min: 9, max: 9, value: 'Genoux gauche', effect: 'Voir règles'},
  {
    min: 10,
    max: 14,
    value: 'Tibia gauche',
    effect: 'Peut renverser en cas du succès critique',
  },
  {
    min: 15,
    max: 21,
    value: 'Cuisse droite',
    effect: 'Peut renverser en cas du succès critique',
  },
  {
    min: 22,
    max: 22,
    value: 'Artère fémorale droite',
    effect: 'ID x2 + DIF -3 sur toutes les actions + -1PV/round',
  },
  {
    min: 23,
    max: 29,
    value: 'Cuisse gauche',
    effect: 'Peut renverser en cas du succès critique',
  },
  {
    min: 30,
    max: 30,
    value: 'Artère fémorale gauche',
    effect: 'ID x2 + DIF -3 sur toutes les actions + -1PV/round',
  },
  {min: 31, max: 34, value: 'Bas ventre'},
  {
    min: 35,
    max: 35,
    value: 'Main droite',
    effect: 'Désarme en cas de succès critique',
  },
  {
    min: 36,
    max: 36,
    value: 'Main gauche',
    effect: 'Désarme en cas de succès critique',
  },
  {
    min: 37,
    max: 40,
    value: 'Avant bas droit',
    effect: "Fait perdre sa prochaine action à l'adversaire",
  },
  {
    min: 41,
    max: 44,
    value: 'Avant bas gauche',
    effect: "Fait perdre sa prochaine action à l'adversaire",
  },
  {min: 45, max: 46, value: 'Flanc droit'},
  {
    min: 47,
    max: 47,
    value: 'Foie',
    effect: 'Adversaire tombe à genoux et subit DIFF -6 au lieu de -3',
  },
  {min: 48, max: 50, value: 'Flanc gauche'},
  {min: 51, max: 57, value: 'Abdominaux'},
  {min: 58, max: 62, value: 'Biceps droit'},
  {min: 63, max: 67, value: 'Biceps gauche'},
  {
    min: 68,
    max: 68,
    value: 'Coeur',
    effect: 'ID x2 + DIF -3 sur toutes les actions + -1PV/round',
  },
  {min: 69, max: 81, value: 'Poitrine'},
  {min: 82, max: 84, value: 'Epaule droite'},
  {
    min: 85,
    max: 85,
    value: 'Aisselle droite',
    effect: 'ID x2 + DIF -3 sur toutes les actions + -1PV/round',
  },
  {min: 86, max: 89, value: 'Epaule gauche'},
  {
    min: 89,
    max: 89,
    value: 'Aisselle gauche',
    effect: 'ID x2 + DIF -3 sur toutes les actions + -1PV/round',
  },
  {
    min: 90,
    max: 90,
    value: 'Clavicule gauche',
    effect:
      "En cas de succès critique, la clavicule se brise empêchant l'adversaire d'utiliser son bras",
  },
  {
    min: 91,
    max: 92,
    value: 'Cou / nuque / gorge',
    effect: 'ID x2 + DIF -3 sur toutes les actions + -1PV/round',
  },
  {
    min: 93,
    max: 93,
    value: 'Clavicule droite',
    effect:
      "En cas de succès critique, la clavicule se brise empêchant l'adversaire d'utiliser son bras",
  },
  {
    min: 94,
    max: 94,
    value: 'Bouche',
    effect: "ID augmenté de moitié, possibilité d'assomer",
  },
  {
    min: 95,
    max: 95,
    value: 'Nez',
    effect: "ID augmenté de moitié, possibilité d'assomer",
  },
  {
    min: 96,
    max: 96,
    value: 'Yeux',
    effect: 'PER divisé par 2, ID et IC divisés par 2',
  },
  {
    min: 97,
    max: 97,
    value: 'Oreille droite',
    effect: "ID augmenté de moitié, possibilité d'assomer",
  },
  {
    min: 98,
    max: 98,
    value: 'Oreille gauche',
    effect: "ID augmenté de moitié, possibilité d'assomer",
  },
  {
    min: 99,
    max: 99,
    value: 'Sommet du crâne / front',
    effect: "ID augmenté de moitié, possibilité d'assomer",
  },
  {min: 100, max: 100, value: 'Entre les deux yeux'},
]

const getLocalisationMessage = (roll, author) => {
  const localisation = localisations.find(
    loc => roll >= loc.min && roll <= loc.max
  )
  return `${author} : ${roll} - ${localisation.value}${
    localisation.effect ? ` (${localisation.effect})` : ''
  }`
}
