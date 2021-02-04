const Discord = require('discord.js')
import auth from '../constants/auth'
import {channels} from '../constants/channels'
import axios from 'axios'

const excusePrefix = '!excuse'
const username = auth.apiStorage.username
const password = auth.apiStorage.password
const baseUrl = `${auth.apiStorage.baseURL}/api/codexcuses`
const request = {
  headers: {
    Authorization: `Basic ${Buffer.from(username + ':' + password).toString(
      'base64'
    )}`,
  },
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
    .addField('Concerned command', `'${msg.channel.name}' <#${msg.channel.id}>`)
    .setDescription(error)

  botChan.send(embedMessage)
}

function getExcuseCmd(msg, client) {
  const requestURL = msg.guild.id

  ;(async () => {
    try {
      // const response = await gotClient.get(requestURL)
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/${requestURL}`,
        ...request,
      })

      console.log('Get: resp status', response.status)
      console.log('Get: resp body', response.data)

      if (response.data != null && response.data.length > 0) {
        return msg.channel.send(formatExcuses(response.data))
      }
      msg.channel.send(
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
  excuseContent = excuseContent.replace(/<@!\w+>/g, '')
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
      const response = await axios({
          method: 'post',
          url: `${baseUrl}/${requestURL}`,
          data: formBody,
          ...request,
      })
      console.log('resp status', response.status)
      console.log('resp body', response.data)

      return msg.channel.send('Excuse ajoutée :+1:')
    } catch (error) {
      logError('Codexcuse', `Error during the POST: ${error} `, client, msg)
      msg.channel.send(
        "Désolé, petit problème interne, j'en ai notifié mes propriétaires"
      )
    }
  })()
}

export const excuseCmd = ({msg, client}) => {
  const msgContent = msg.content.trim()
  const excuseContent = msgContent.slice(excusePrefix.length)

  // Case of !excuse without arguments or !excuses, hence list all excuses
  // if !excuses is used argument are ignored
  if (excuseContent.trim() === '' || excuseContent.trim().startsWith('s')) {
    return getExcuseCmd(msg, client)
  }

  return addExcuse(msg, client, excuseContent)
}

export const excuseInfo =
  excusePrefix + " <contenu_de_l'excuse> <pseudo_de_l'auteur>"
