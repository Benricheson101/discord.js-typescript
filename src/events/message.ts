import { defaultGuildDocument, errors } from '../setup'
import { Message } from 'discord.js'
import { GuildDocument } from '@types'
import Command from '@command'
import Client from '@util/Client'

export = async (client: Client, message: Message) => {
  if (message.author.bot) return
  if (message.channel.type !== 'text') return

  // @ts-ignore
  let guild: GuildDocument = await message.guild.db

  if (!guild) guild = defaultGuildDocument(message.guild.id)

  if (!message.content.startsWith(guild.config.prefix)) return

  const args: string[] = message.content.slice(guild.config.prefix.length).split(/\s+/)
  const command: string = args.shift().toLowerCase()

  const cmd: Command | null = client.commands.get(command) ||
    client.commands.find((c: Command) => c.config.aliases && c.config.aliases.includes(command))
  if (!cmd) return

  if (cmd.config.disabled && !client.options.admins.includes(message.author.id)) return await message.channel.send('🔒 This command has been disabled.')

  if (client.options.startupCooldown && client.uptime < client.options.startupCooldown && !client.options.admins.includes(message.author.id)) return await message.channel.send('🕐 I am still starting up, please try again in a few seconds')

  try {
    cmd.run(client, message, args)
  } catch (err) {
    console.error(err)
    message.channel.send(errors.generic)
  }
}
