import Command from '@command'

export default new Command({
  name: 'commands',
  aliases: ['listcommands', 'commandlist'],
  help: {
    description: 'Get a list of commands',
    category: 'other'
  }
}, async (client, message) => {
  const embed = client.defaultEmbed()
    .setTitle('Here is a list of my commands:')
    .setDescription(client.commands.map((c) => c.config.name).join('\n'))
  return await message.channel.send(embed)
})
