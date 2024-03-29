const {isCommand, getContent} = require('../utils/messageUtils')
const {commands, fallback} = require('../commands/commands')

export const messageHandler = (msg, client) => {
  if (isCommand(msg.content)) {
    const content = getContent(msg.content)
    const split = content.split(' ')
    const command = split[0]
    const params = split[1]

    return commands[command]
      ? commands[command].action({msg, params, client})
      : fallback({msg, command})
  }
}
