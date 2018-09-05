import info from '../../package.json'

const infoMessage = `Name: ${info.name}\nDescription: ${info.description}\nVersion : ${info.version}\nAuthor: ${info.author}`

export const commands = {
  help: ({msg}) => msg.channel.send(commandList, {code: 'markdown'}),
  ping: ({msg}) => msg.channel.send('pong'),
  info: ({msg}) => msg.channel.send(infoMessage, {code: 'markdown'}),
  hello: ({msg}) => msg.channel.send(`Kikoo ${msg.author} ( ͡° ͜ʖ ͡°)`),
}

const commandList = `# Available commands\n${Object.keys(commands).map(key => `* ${key}`).join("\n")}`

export const fallback = async ({msg, content}) => {
  const channel = await msg.author.createDM()
  channel.send(`Pas de commande associée à **${content}**`)
}