import Client from '@util/Client'
import { User } from 'discord.js'
import * as chalk from 'chalk'

export = async (client: Client) => {
  const teamMembers: User[] | void = await client.fetchTeamMembers().catch(console.error)

  if (teamMembers) {
    for (const admin of teamMembers) {
      client.admins.add(admin.id)
      console.log(chalk`{gray [{bold A}] Found {bold ${admin.tag}}}`)
    }
  }

  console.log(chalk`{red.strikethrough ${'-'.repeat((client.user.tag + ' is now online!').length)}}`)
  console.log(chalk`{cyan {bold ${client.user.tag}} is now online!}{cyan
  Guilds: {bold ${client.guilds.cache.size}}
  Admins: {bold ${Array.from(client.admins).length}}
  Commands: {bold ${client.commands.size}}}`)
}
