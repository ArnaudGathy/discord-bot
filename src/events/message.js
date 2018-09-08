import { isCommand, getContent } from "../utils/messageUtils";
import { commands, fallback } from "../commands/commands";

export const messageHandler = (msg) => {
  if (isCommand(msg.content)) {
    const content = getContent(msg.content)
    const split = content.split(' ')
    const command = split[0]
    const params = {}

    console.log(params)
    return commands[command] ? commands[command].action({msg, params}) : fallback({msg, command})
  }
}