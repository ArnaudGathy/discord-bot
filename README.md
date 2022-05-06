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


## Docker Install

### Discord Bot

Build
```bash
docker build --pull --tag arno/discord-bot:1.0.0 .
```

Run:
```bash
docker run \
    --name discord-bot-blaze \
    --restart always \
    --detach \
    --env NODE_ENV=production \
    arno/discord-bot:1.0.0
# To follow the logs:
docker logs -f --tail 100 discord-bot-blaze
```

### Slash Commands

Build:
```bash
docker build --pull --tag arno/discord-commands:1.0.0 -f deploy-commands.Dockerfile .
```

Run the image:
```bash
docker run --rm -it arno/discord-commands:1.0.0
```
