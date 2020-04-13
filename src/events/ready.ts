import Client from '@util/Client'

export = (client: Client) => {
  console.log(`${client.user.tag} is now online!
  Guilds: ${client.guilds.cache.size}
  Channels: ${client.channels.cache.size}
  Users: ${client.users.cache.size}`)
}
