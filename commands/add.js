const {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adds two numbers.')
    .addNumberOption(option => option.setName('number1').setDescription('The first number').setRequired(true))
    .addNumberOption(option => option.setName('number2').setDescription('The second number').setRequired(true)),
  async execute(interaction) {
	  const { options } = interaction

	  const num1 = options.getNumber('number1') || 0
	  const num2 = options.getNumber('number2') || 0

    await interaction.reply({
      content: `The sum is ${num1 + num2}`,
      ephemeral: true,
    })
  },
}
