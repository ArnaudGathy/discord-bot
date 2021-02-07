const Discord = require('discord.js')
import auth from '../constants/auth'
import {channels} from '../constants/channels'
import axios from 'axios'

const excusePrefix = '!excuse'
const username = auth.apiStorage.username
const password = auth.apiStorage.password
const baseUrl = `${auth.apiStorage.baseURL}/api/codexcuses`
const headers = {
  Authorization: `Basic ${Buffer.from(username + ':' + password).toString(
    'base64'
  )}`,
}

function formatExcuses(body) {
  const message = new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle("Liste d'excuses:")

  body.map((excuse, idx) => {
    message.addField(
      `Excuse #${idx + 1}`,
      `<@${excuse.author.id}>: ${excuse.content}`
    )
  })
  return message
}

// formatFooter formats the footer of embed message with pagination metadata
function formatFooter(respMessage, paginationMeta) {
  // Don't print anything if there is no other pages
  if (paginationMeta.total_pages === 1) {
    return respMessage
  }

  let nextPageMessage
  // Last page
  if (paginationMeta.current_page === paginationMeta.total_pages) {
    nextPageMessage = ` - utilise la commande <!excuses page ${paginationMeta.prev_page}> pour la page précédente`
  }
  // There is a next page available
  if (paginationMeta.current_page < paginationMeta.total_pages) {
    nextPageMessage = ` - utilise la commande <!excuses page ${paginationMeta.next_page}> pour la page suivante`
  }

  respMessage.setFooter(
    `Page ${paginationMeta.current_page}/${paginationMeta.total_pages}${nextPageMessage}`
  )
  return respMessage
}

function logError(contextName, error, client, msg) {
  const botChan = client.channels.get(channels.test_bot)

  console.error('Fail to handle codexcuse:', error)
  const embedMessage = new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle('Error during ' + contextName)
    .addField(
      'Happened on Channel',
      `'${msg.channel.name}' <#${msg.channel.id}>`
    )
    .addField('Concerned command', msg.content)
    .setDescription(error)

  botChan.send(embedMessage)
}

function getExcuseCmd(msg, client, excuseContent) {
  let requestURL = msg.guild.id

  excuseContent = excuseContent.toLowerCase().trim()
  if (excuseContent !== '') {
    const usage = `C'est soit \`!excuses\` soit \`!excuses page <n° de la page>\``
    const args = excuseContent.split(/\s+/)

    // Check if command is formatted as `page <number>`
    if (args[0] !== 'page' || (args[0] === 'page' && isNaN(args[1]))) {
      return msg.channel.send(usage)
    }
    requestURL += `?page=${args[1]}`
  }

  ;(async () => {
    try {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/${requestURL}`,
        headers,
      })

      console.log(response.data)
      if (
        response.data != null &&
        response.data.excuses != null &&
        response.data.excuses.length > 0
      ) {
        let respMessage = formatExcuses(response.data.excuses)

        if (response.data.meta != null) {
          respMessage = formatFooter(respMessage, response.data.meta)
        }
        return msg.channel.send(respMessage)
      }
      if (response.data.meta != null) {
        const paginationMeta = response.data.meta
        if (paginationMeta.current_page > paginationMeta.total_pages) {
          return msg.channel.send(
            `La page demandée est au-délà du nombre max de page (${paginationMeta.total_pages})`
          )
        }
      }
      return msg.channel.send(
        `Il n'y a pas encore d'excuse. Utilise la commande: \`${excuseInfo}\``
      )
    } catch (error) {
      logError(
        'Codexcuse',
        `Error during add excuse POST request: ${error} `,
        client,
        msg
      )
      msg.channel.send(
        "Désolé, petit problème interne, j'en ai notifié mes propriétaires"
      )
    }
  })()
}

function addExcuse(msg, client, excuseContent) {
  const requestURL = msg.guild.id

  // Even if no one is mentioned `msg.mentions.users` is not null
  if (msg.mentions.users != null) {
    if (msg.mentions.users.size > 1) {
      return msg.channel.send(`Il ne faut qu'un seul auteur`)
    }
    if (msg.mentions.users.size === 0) {
      return msg.channel.send(
        `Il faut de la délation, tu dois mentionner l'auteur (avec une mention discord @pseudo) !`
      )
    }
  }

  // As mentions in message is formatted like <@!user_id>
  // We remove the mention from message content.
  excuseContent = excuseContent.replace(/<@!?(\d+)>/g, '')
  const author = msg.mentions.users.first()
  const formBody = {
    title: 'Excuse', // Mandatory field for the API, but useless in our cases.
    content: excuseContent,
    author: {
      id: author.id,
      username: `${author.username}#${author.discriminator} `,
    },
    reporter: {
      id: msg.author.id,
      username: `${msg.author.username}#${msg.author.discriminator} `,
    },
  }

  ;(async () => {
    try {
      await axios({
        method: 'post',
        url: `${baseUrl}/${requestURL}`,
        data: formBody,
        headers,
      })

      return msg.channel.send('Excuse ajoutée :+1:')
    } catch (error) {
      logError('Codexcuse', `Error during the POST: ${error} `, client, msg)
      msg.channel.send(
        "Désolé, petit problème interne, j'en ai notifié mes propriétaires"
      )
    }
  })()
}

function getRandomExcuse(msg, client) {
  const requestURL = msg.guild.id

  ;(async () => {
    try {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/${requestURL}/random`,
        headers,
      })

      if (response.data != null) {
        const excuse = response.data
        const message = new Discord.RichEmbed()
          .setColor('#0099ff')
          .setTitle('Random excuse')

        message.addField(
          `Excuse N°${response.data.id}`,
          `<@${excuse.author.id}>: ${excuse.content}`
        )
        return msg.channel.send(message)
      }
      msg.channel.send(
        `Il n'y a pas encore d'excuse. Utilise la commande: \`${excuseInfo}\``
      )
    } catch (error) {
      logError(
        'Codexcuse random',
        `Error during add excuse POST request: ${error} `,
        client,
        msg
      )
      msg.channel.send(
        "Désolé, petit problème interne, j'en ai notifié mes propriétaires"
      )
    }
  })()
}

export const excuseCmd = ({msg, client}) => {
  const msgContent = msg.content.trim()
  const excuseContent = msgContent.slice(excusePrefix.length)

  // Case of !excuse without arguments, hence list all excuses
  if (excuseContent.trim() === '') {
    return getExcuseCmd(msg, client, excuseContent)
  }
  // Case of !excuses, hence list all excuses
  if (excuseContent.startsWith('s')) {
    return getExcuseCmd(msg, client, excuseContent.slice(1))
  }
  if (excuseContent.trim() === 'random') {
    return getRandomExcuse(msg, client)
  }

  return addExcuse(msg, client, excuseContent)
}

export const excuseInfo =
  excusePrefix +
  ` <contenu_de_l'excuse> <pseudo_de_l'auteur>
* !excuse random - retourne une excuse random parmi la liste des excuses`
