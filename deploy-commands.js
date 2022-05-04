// This file is used to register and update the slash commands for the guild.
// To run this script, use the following command:
// `node deploy-commands.js`

// It is mandatory to set the 'applications.commands' scope in the scopes section of the OAuth2
// settings for the bot in the discord developer portal.

// About the commands guide is here:
// https://discordjs.guide/popular-topics/builders.html#commands

const {REST} = require('@discordjs/rest')
const {Routes} = require('discord-api-types/v9')
const {discord, token} = require('./src/constants/auth.json')
const fs = require('node:fs')

const commands = []
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  if (command.data) {
      commands.push(command.data.toJSON())
  }
}

const rest = new REST({version: '9'}).setToken(token.discord);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(
      Routes.applicationGuildCommands(discord.clientId, discord.guildId),
      {
        body: commands,
      }
    ).then((commands) => {
        for (const cmd of commands) {
            console.log('Successfully registered the command:', cmd.name)
        }
    })

    console.log('Successfully reloaded slash commands.')
  } catch (error) {
    console.error(error)
  }
})()
