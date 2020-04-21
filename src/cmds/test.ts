import Command from '@command'
import { pages, PageOptions } from '~/util/misc'

export default new Command({
  name: 'test'
}, (_, message) => {
  /* const e = new MessageEmbed()
    .addField('Guilds', `\`\`\`fix\n${client.guilds.cache.size}\`\`\``, true)
    .addField('Users', `\`\`\`fix\n${client.users.cache.size}\`\`\``, true)
    .addField('Channels', `\`\`\`fix\n${client.channels.cache.size}\`\`\``, true)

    .addField('Commands', `\`\`\`fix\n${client.commands.size}\`\`\``, true)
    .addField('Ping', `\`\`\`fix\n${client.ws.ping}ms\`\`\``, true)
    .addField('Uptime', `\`\`\`fix\n${client.uptime}ms\`\`\``, true)

    .setColor('#8d6e1a')

  message.channel.send(e) */
  const options: PageOptions = {
    time: 5000,
    emojis: {
      left: '579468510158389258', right: '579468510019977233'
    },
    hideControlsSinglePage: true
  }
  pages(message, ['1', '2', '3', '4', '5'], options)
})
