const {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('excuse')
    .setDescription('Récupère toutes les excuses.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('user')
        .setDescription("Récupère les excuses de l'utilisateur")
        .addUserOption((option) => option.setName('cible').setDescription("L'utilisateur en question").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Ajoute une nouvelle excuse')
        .addUserOption((option) => option.setName('cible').setDescription("Il faut de la délation, tu dois mentionner l'auteur").setRequired(true))
    ),
  async execute(interaction) {
    await interaction.deferReply()
    const { options } = interaction

    await wait(5000)
    await interaction.editReply('')
  },
}
