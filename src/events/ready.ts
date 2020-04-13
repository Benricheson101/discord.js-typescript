import Client from '@util/Client'
import * as chalk from 'chalk'

export = (client: Client) => {
  console.log(chalk`{red.strikethrough ${'-'.repeat((client.user.tag + ' is now online!').length)}}`)
  console.log(chalk`{cyan {bold ${client.user.tag}} is now online!}
  {cyan Guilds: {bold ${client.guilds.cache.size}}
  Channels: {bold ${client.channels.cache.size}}
  Users: {bold ${client.users.cache.size}}}`)
}
