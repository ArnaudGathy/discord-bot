const {SlashCommandBuilder} = require('@discordjs/builders')
const {CommandInteraction} = require('discord.js')
const {getExcuseCmd, getExcuseByUser, addExcuse, getRandomExcuse} = require('../src/commands/excuse')

// Following const are the name of option displayed to users
const commandName = 'excuse'
const subcommandAllOptionName = 'all'
const subcommandUserOptionName = 'user'
const subcommandAddOptionName = 'add'
const subcommandRandomOptionName = 'random'
const subcommandPageNumberOptionName = 'page_num'
const targetOptionName = 'cible'
const contentOptionName = 'contenu'

module.exports = {
  //
  // Excuse commands registration
  //
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Gère les excuses.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName(subcommandAllOptionName)
        .setDescription('Affiche toutes les excuses.')
        .addNumberOption((option) =>
          option
            .setName(subcommandPageNumberOptionName)
            .setDescription('Le n° de la page')
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(subcommandUserOptionName)
        .setDescription("Affiche les excuses d'un utilisateur cible")
        .addUserOption((option) =>
          option
            .setName(targetOptionName)
            .setDescription("L'utilisateur en question")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(subcommandAddOptionName)
        .setDescription('Ajoute une nouvelle excuse')
        .addUserOption((option) =>
          option
            .setName(targetOptionName)
            .setDescription(
              "Il faut de la délation, tu dois mentionner l'auteur"
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName(contentOptionName)
            .setDescription("Le contenu de l'excuse")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(subcommandRandomOptionName)
        .setDescription('Affiche une excuse random')
    ),

  /**
   * Execute excuse commands
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply()
    const { options } = interaction

    let target;
    const subcommand = options.getSubcommand()
    switch (subcommand) {
      case subcommandAllOptionName:
        let pageNum = interaction.options.getNumber(subcommandPageNumberOptionName)
        getExcuseCmd(interaction, pageNum)
        break;

      case subcommandUserOptionName:
        target = interaction.options.getUser(targetOptionName)
        getExcuseByUser(interaction, target.id)
        break;

      case subcommandAddOptionName:
        target = interaction.options.getUser(targetOptionName)
        const content = interaction.options.getString(contentOptionName)
        addExcuse(interaction, content, target)
        break;

      case subcommandRandomOptionName:
        getRandomExcuse(interaction)
        break;

      // case of get all excuses
      default:
        getExcuseCmd(interaction)
        break;
    }
  },
}
