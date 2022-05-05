const Discord = require('discord.js')
const { MessageActionRow, MessageButton } = require('discord.js');
const auth = require('../constants/auth')
const {channels} = require('../constants/channels')
const axios = require('axios')

const excusePrefix = '/excuse'
const username = auth.apiStorage.username
const password = auth.apiStorage.password
const baseUrl = `${auth.apiStorage.baseURL}/api/codexcuses`
const headers = {
  Authorization: `Basic ${Buffer.from(username + ':' + password).toString(
    'base64'
  )}`,
}
const excuseAddInfo = excusePrefix + " add cible:<pseudo_de_l'auteur> contenu:<contenu_de_l'excuse>"

// Defines the availability time of the pagination buttons (in milliseconds).
// After this delay the pagination system for the concerned message won't be possible anymore.
// Note that on each use (click) of pagination's buttons the timer is reset thanks to `resetTimer()`.
const buttonTimeout = 15000

// Global variables to handle pagination between request and handlers
// There is a race condition possible if two (or more) messages need pagination
// are call by the same time (during the `buttonTimeout` interval).
let paginationPageMeta
let paginationRespMessage

module.exports = {
  getExcuseCmd: async (msg, pageNum = null, isPaginationCall = false) => {
    let requestParam = msg.guild.id

    if (pageNum != null) {
      requestParam += `?page=${pageNum}`
    }
    const responseData = await fetchExcuses(requestParam, msg)

    if (
      responseData == null ||
      responseData.excuses == null ||
      responseData.excuses.length <= 0
    ) {
      msg.editReply({
        content: `Il n'y a pas encore d'excuse. Utilise la commande: ${excuseAddInfo}`,
      })
      return
    }

    paginationRespMessage = formatExcuses(responseData.excuses)

    // Don't format the footer and add buttons if there is no other pages or if there is no pagination metadata
    if (
      responseData.meta == null ||
      responseData.meta.total_pages === 1 ||
      responseData.meta.total_pages === 0
    ) {
      await msg.editReply({embeds: [paginationRespMessage], components: []})
      return
    }

    paginationRespMessage = formatFooter(
      paginationRespMessage,
      responseData.meta
    )
    let paginationButtons = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('page_prev')
          .setLabel('<')
          .setStyle('PRIMARY')
      )
      .addComponents(
        new MessageButton()
          .setCustomId('page_next')
          .setLabel('>')
          .setStyle('PRIMARY')
      )
    paginationPageMeta = responseData.meta

    const paginationResponse = await msg.editReply({
      embeds: [paginationRespMessage],
      components: [paginationButtons],
    })
    // We don't want to register handler anymore if it is already done
    if (isPaginationCall) return
    module.exports.handlePagination(paginationResponse, msg)
  },

  addExcuse: async (msg, excuseContent, author) => {
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

    const isSuccess = await postExcuse(msg.guild.id, formBody, msg)
    if (!isSuccess) return

    return msg.editReply({content: 'Excuse ajoutée :+1:'})
  },

  getRandomExcuse: async (msg) => {
    const responseData = await fetchExcuses(`${msg.guild.id}?random=1`, msg)

    if (responseData == null) {
      msg.editReply({
        content: `Il n'y a pas encore d'excuse. Utilise la commande: \`${excuseAddInfo}\``,
      })
      return
    }

    const excuse = responseData
    const message = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Random excuse')

    message.addField(
      `Excuse ID: ${responseData.id}`,
      `<@${excuse.author.id}>: ${excuse.content}`
    )
    return msg.editReply({embeds: [message]})
  },

  getExcuseByUser: async (msg, authorId, isPaginationCall = false) => {
    const responseData = await fetchExcuses(
      `${msg.guild.id}?user=${authorId}`,
      msg
    )

    if (
      responseData == null ||
      responseData.excuses == null ||
      responseData.excuses.length <= 0
    ) {
      msg.editReply({
        content: `Il n'y a pas encore d'excuse. Utilise la commande: \`${excuseAddInfo}\``,
      })
      return
    }

    paginationRespMessage = formatExcuses(responseData.excuses)

    // Don't format the footer and add buttons if there is no other pages or if there is no pagination metadata
    if (
      responseData.meta == null ||
      responseData.meta.total_pages === 1 ||
      responseData.meta.total_pages === 0
    ) {
      await msg.editReply({embeds: [paginationRespMessage], components: []})
      return
    }

    paginationRespMessage = formatFooter(
      paginationRespMessage,
      responseData.meta
    )
    const paginationButtons = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('page_prev')
          .setLabel('<')
          .setStyle('PRIMARY')
      )
      .addComponents(
        new MessageButton()
          .setCustomId('page_next')
          .setLabel('>')
          .setStyle('PRIMARY')
      )
    paginationPageMeta = responseData.meta

    const paginationResponse = await msg.editReply({
      embeds: [paginationRespMessage],
      components: [paginationButtons],
    })
    // We don't want to register handler anymore if it is already done
    if (isPaginationCall) return
    module.exports.handlePagination(paginationResponse, msg)
  },

  handlePagination: (excuseMessage, msg) => {
    if (!excuseMessage) return
    ;(async () => {
      // Only author of the command can use pagination
      const filter = (i) =>
        (i.customId === 'page_prev' || i.customId === 'page_next') &&
        i.user.id === msg.user.id
      const collector = await excuseMessage.createMessageComponentCollector({
        filter,
        time: buttonTimeout,
      })

      collector.on('collect', async (i) => {
        await i.deferUpdate()
        let pageNum = paginationPageMeta.current_page
        switch (i.customId) {
          case 'page_prev':
            pageNum = pageNum > 1 ? --pageNum : paginationPageMeta.total_pages
            break
          case 'page_next':
            pageNum = pageNum >= paginationPageMeta.total_pages ? 1 : ++pageNum
            break
          default:
            break
        }
        console.debug('pagination system, pageNum: ', pageNum)
        // Currently only `getExcuseCmd` has pagination system implemented, so
        // no need to choose the correct function.
        // This will be done by using:
        // msg.options.getSubcommand()
        await module.exports.getExcuseCmd(i, pageNum, true)

        // Reset buttonTimeout and restart to wait again
        collector.resetTimer()
      })

      // Remove button from message after the timeout
      collector.on('end', (_, reason) => {
        if (reason !== 'messageDelete') {
          excuseMessage.edit({
            embeds: [paginationRespMessage],
            components: [],
          })
        }
      })
    })()
  },
}

//
// Tools
//

function formatExcuses(body) {
  const message = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle("Liste de #codexcuse")

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

  respMessage.setFooter({
    text: `Page ${paginationMeta.current_page}/${paginationMeta.total_pages}`,
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
    .addField('Command type', msg.type)
    .setDescription(error)

  botChan.send({embeds: [embedMessage]})
}

async function postExcuse(requestParam, formBody, msg) {
  try {
    console.debug('postExcuses, parameters:', requestParam)

    const response = await axios({
      method: 'post',
      url: `${baseUrl}/${requestParam}`,
      data: formBody,
      headers,
    })
    return response.status == 200;
  } catch (error) {
    logError('Codexcuse', `Error during POST ${baseUrl}/${requestParam}: ${error} `, msg.client, msg)
    msg.editReply({
      content: "Désolé, petit problème interne, j'en ai notifié mes propriétaires",
    })
    return false
  }
}

async function fetchExcuses(requestParam, msg) {
  try {
    console.debug('fetchExcuses, parameters:', requestParam)
    const response = await axios({
      method: 'get',
      url: `${baseUrl}/${requestParam}`,
      headers,
    })
    return response.data
  } catch (error) {
    logError('Codexcuses', `Error during GET ${baseUrl}/${requestParam}: ${error} `, msg.client, msg)
    msg.editReply({ content: "Désolé, petit problème interne, j'en ai notifié mes propriétaires" })
  }
}
