import info from '../../package.json'

const infoMessage = `Nom: ${info.name}\nDescription: ${info.description}\nVersion : ${info.version}\nAuteur: ${info.author}\nGithub: ${info.homepage}`

export const commands = {
  help: {
    action: ({msg}) => msg.channel.send(commandList, {code: 'markdown'}),
    info: "Affiche la liste des commandes",
  },
  ping: {
    action: ({msg}) => msg.channel.send('pong'),
    info: "Test la présence du bot avec un ping -> pong",
  },
  info: {
    action: ({msg}) => msg.channel.send(infoMessage, {code: 'markdown'}),
    info: "Informations sur le bot",
  },
  hello: {
    action: ({msg}) => msg.channel.send(`Kikoo ${msg.author} ( ͡° ͜ʖ ͡°)`),
    info: "Dites bonjour au bot !",
  },
}

const commandList = `# Commandes disponibles\n${Object.entries(commands).map(([key, value]) => `* !${key} - ${value.info}`).join("\n")}`

export const fallback = async ({msg, command}) => {
  const channel = await msg.author.createDM()
  const sadGif = "https://giphy.com/gifs/walk-away-sad-6bWNHVAoj7tNS"
  channel.send(`Pas de commande associée à **${command}**\n${sadGif}`)
}