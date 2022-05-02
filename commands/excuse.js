const {SlashCommandBuilder} = require('@discordjs/builders')
import {getExcuseCmd, getExcuseByUser, addExcuse, getRandomExcuse} from '../src/commands/excuse'

// Following const are the name of option displayed to users
const commandName = 'excuse'
const subcommandUserOptionName = 'user'
const subcommandAddOptionName = 'add'
const targetOptionName = 'cible'
const contentOptionName = 'contenu'
const subcommandRandomOptionName = 'random'

module.exports = {
   //
   // Command registration
   //
   data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Affiche toutes les excuses.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName(subcommandUserOptionName)
        .setDescription("Affiche les excuses de l'utilisateur")
        .addUserOption((option) => option.setName(targetOptionName).setDescription("L'utilisateur en question").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(subcommandAddOptionName)
        .setDescription('Ajoute une nouvelle excuse')
        .addUserOption((option) => option.setName(targetOptionName).setDescription("Il faut de la délation, tu dois mentionner l'auteur").setRequired(true))
        .addStringOption((option) => option.setName(contentOptionName).setDescription('Le contenu de l\'excuse'))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(subcommandRandomOptionName)
        .setDescription('Affiche une excuse random')
   ),

   //
   // Command execution
   //
   async execute(interaction) {
    // await interaction.deferReply()
    await interaction.reply('Inc')
    const { options } = interaction

    let target;
    const subcommand = options.getSubcommand()
    switch (subcommand) {
      case subcommandUserOptionName:
        target = interaction.options.getUser(targetOptionName)
        getExcuseByUser(interaction, target.id)
        break;

      case subcommandAddOptionName:
        target = interaction.options.getUser(targetOptionName)
        const content = interaction.options.getUser(contentOptionName)
        addExcuse(interaction, content, target.id)
        break;

      case subcommandRandomOptionName:
        getRandomExcuse(interaction)
        break;

      // case of get all excuses
      default:
        getExcuseCmd(interaction)
        break;
    }


    // await interaction.editReply('')
  },
}
