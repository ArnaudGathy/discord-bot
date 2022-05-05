# DISCORD BOT

This is a test project for a discord bot.

## How to use it

Rename `./src/constants/auth_example.json` to `./src/constants/auth.json` and
replace fields in accordance

## To run in dev

```bash
yarn dev
```

## Slash Commands

### Commands Registration

To be able to use slash commands on the server you must run the script `deploy-commands.js`
to register the command on the server. It can takes few seconds or minutes to be available.

```bash
node ./deploy-commands.js
```

### Commands Rights

It is mandatory to set the 'applications.commands' scope in the scopes section of the OAuth2
settings for the bot in the discord developer portal.

About the commands doc is here:
https://discordjs.guide/popular-topics/builders.html#commands
