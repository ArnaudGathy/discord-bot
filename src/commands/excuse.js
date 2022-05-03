const Discord = require('discord.js')
import auth from '../constants/auth'
import {channels} from '../constants/channels'
import axios from 'axios'

const excusePrefix = '/excuse'
const username = auth.apiStorage.username
const password = auth.apiStorage.password
const baseUrl = `${auth.apiStorage.baseURL}/api/codexcuses`
const headers = {
  Authorization: `Basic ${Buffer.from(username + ':' + password).toString(
    'base64'
  )}`,
}
const excuseAddInfo =
  excusePrefix + "add cible:<pseudo_de_l'auteur> contenu:<contenu_de_l'excuse>"

  function formatExcuses(body) {
  const message = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle("Liste d'excuses:")

  body.map((excuse, idx) => {
    if (excuse.author != null && excuse.content != null) {
      message.addField(
        `Excuse #${idx + 1}`,
        `<@${excuse.author.id}>: ${excuse.content}`
      )
    }
  })
  return message
}

// formatFooter formats the footer of embed message with pagination metadata
function formatFooter(respMessage, paginationMeta) {
  // Don't print anything if there is no other pages or if there is no pagination metadata
  if (paginationMeta.total_pages === 1 || paginationMeta.total_pages === 0) {
    return respMessage
  }

  let nextPageMessage
  // Last page
  if (paginationMeta.current_page === paginationMeta.total_pages) {
    nextPageMessage = ` - utilise la commande </excuse all page:${paginationMeta.prev_page}> pour la page précédente`
  }
  // There is a next page available
  if (paginationMeta.current_page < paginationMeta.total_pages) {
    nextPageMessage = ` - utilise la commande </excuse all page:${paginationMeta.next_page}> pour la page suivante`
  }
  respMessage.setFooter({
    text: `Page ${paginationMeta.current_page}/${paginationMeta.total_pages}${nextPageMessage}`,
  })
  return respMessage
}

function logError(contextName, error, client, msg) {
  const botChan = client.channels.cache.get(channels.test_bot)

  console.error('Fail to handle codexcuse:', error)
  const embedMessage = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Error during ' + contextName)
    .addField(
      'Happened on Channel',
      `'${msg.channel.name}' <#${msg.channel.id}>`
    )
    .addField('Concerned command', msg.toString())
    .setDescription(error)

  botChan.send({embeds: [embedMessage]})
}

export const getExcuseCmd = (msg, pageNum = null) => {
  let requestURL = msg.guild.id

  if (pageNum != null) {
    requestURL += `?page=${pageNum}`
  }

  ;(async () => {
    try {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/${requestURL}`,
        headers,
      })

      if (
        response.data != null &&
        response.data.excuses != null &&
        response.data.excuses.length > 0
      ) {
        let respMessage = formatExcuses(response.data.excuses)

        if (response.data.meta != null) {
          respMessage = formatFooter(respMessage, response.data.meta)
        }
        return msg.editReply({embeds: [respMessage], ephemeral: false })
      }
      if (response.data.meta != null) {
        const paginationMeta = response.data.meta
        if (paginationMeta.current_page > paginationMeta.total_pages) {
          return msg.editReply({
            content: `La page demandée est au-delà du nombre max de page (${paginationMeta.total_pages})`,
          })
        }
      }
      msg.editReply({
        content: `Il n'y a pas encore d'excuse. Utilise la commande: ${excuseAddInfo}`,
      })
      return;
    } catch (error) {
      logError(
        'Codexcuses',
        `Error during GET request: ${error} `,
        msg.client,
        msg
      )
      msg.editReply({
        content: "Désolé, petit problème interne, j'en ai notifié mes propriétaires",
      })
    }
  })()
}

export const addExcuse = (msg, excuseContent, author) => {
  const requestURL = msg.guild.id

  // As mentions in message is formatted like <@!user_id>
  // We remove the mention from message content.
  // excuseContent = excuseContent.replace(/<@!?(\d+)>/g, '')
  // const author = msg.mentions.users.first()
  const formBody = {
    title: 'Excuse', // Mandatory field for the API, but useless in our cases.
    content: excuseContent,
    author: {
      id: author.id,
      username: `${author.username}#${author.discriminator} `,
    },
    reporter: {
      id: msg.user.id,
      username: `${msg.user.username}#${msg.user.discriminator} `,
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

      return msg.editReply({ content: 'Excuse ajoutée :+1:', components: [] });
    } catch (error) {
      logError('Codexcuse', `Error during the POST: ${error} `, msg.client, msg)
      msg.editReply({
        content: "Désolé, petit problème interne, j'en ai notifié mes propriétaires",
      })
    }
  })()
}

export const getRandomExcuse = (msg) => {
  const requestURL = msg.guild.id

  ;(async () => {
    try {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/${requestURL}?random=1`,
        headers,
      })

      if (response.data != null) {
        const excuse = response.data
        const message = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Random excuse')

        message.addField(
          `Excuse ID: ${response.data.id}`,
          `<@${excuse.author.id}>: ${excuse.content}`
        )
        return msg.editReply({embeds: [message]})
      }
      msg.editReply({
        content: `Il n'y a pas encore d'excuse. Utilise la commande: \`${excuseAddInfo}\``,
      })
    } catch (error) {
      logError(
        'Codexcuse random',
        `Error during GET request: ${error} `,
        msg.client,
        msg
      )
      msg.editReply({
        content: "Désolé, petit problème interne, j'en ai notifié mes propriétaires",
      })
    }
  })()
}

export const getExcuseByUser = (msg, authorId) => {
  const requestURL = `${msg.guild.id}?user=${authorId}`

  ;(async () => {
    try {
      const response = await axios({
        method: 'get',
        url: `${baseUrl}/${requestURL}`,
        headers,
      })
      if (
        response.data != null &&
        response.data.excuses != null &&
        response.data.excuses.length > 0
      ) {
        let respMessage = formatExcuses(response.data.excuses)

        if (response.data.meta != null) {
          respMessage = formatFooter(respMessage, response.data.meta)
        }
        return msg.editReply({embeds: [respMessage]})
      }

      msg.editReply({
        content: `Il n'y a pas encore d'excuse. Utilise la commande: \`${excuseAddInfo}\``,
      })
      return
    } catch (error) {
      logError(
        'Codexcuse by user',
        `Error during GET request: ${error} `,
        msg.client,
        msg
      )
      msg.editReply({
        content: "Désolé, petit problème interne, j'en ai notifié mes propriétaires",
      })
    }
  })()
}
