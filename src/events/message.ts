import { defaultGuildDocument } from '../setup'
import { Message } from 'discord.js'
import { GuildDocument } from '@types'
import Command, { getLevel } from '@command'
import Client from '@util/Client'

export = async (client: Client, message: Message) => {
  if (!client.db) return await message.channel.send(':x: A database error occurred!')
  if (message.author.bot) return
  if (message.channel.type !== 'text') return

  let guild: GuildDocument = await message.guild.db

  if (!guild) {
    guild = defaultGuildDocument(message.guild.id)
    client.db.insert('guilds', guild)
  }

  if (!message.content.startsWith(guild.config.prefix)) return

  const args: string[] = message.content.slice(guild.config.prefix.length).split(' ')
  const command: string = args.shift().toLowerCase()

  const cmd: Command | null = client.commands.get(command) ||
    client.commands.find((c: Command) => c.config?.aliases?.includes(command))
  if (!cmd) return

  if (cmd.config?.level > getLevel(message.member)) return await message.channel.send('🔒 You do not have permission to use this command.')

  if (cmd.config.disabled && !client.admins.has(message.author.id)) return await message.channel.send('🔒 This command has been disabled.')

  if (client.options?.startupCooldown > client.uptime && !client.admins.has(message.author.id)) return await message.channel.send('🕐 I am still starting up, please try again in a few seconds')

  try {
    cmd.run(client, message, args)
  } catch (err) {
    console.error(err)
    message.channel.send(client.constants.errors.generic)
  }
}
