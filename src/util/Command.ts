/* eslint no-useless-constructor: "off" */
import { CommandOptions, CommandFunction } from '@types'
import { GuildMember } from 'discord.js'

export default class {
  constructor (
    public config: CommandOptions,
    public run: CommandFunction
  ) {}
}

/**
 * Get the permission level for a user
 * Key:
 * 3: bot administrators
 * 2: server administrators
 * 1: server moderators
 * 0: everyone else
 *
 * @param {GuildMember} user The user to check
 * @returns {number}
 */
// TODO
export function getLevel (user: GuildMember): number {
  if (!(user instanceof GuildMember)) throw new TypeError('User must be a GuildMember')
  // user is a bot administrator
  if (user.client.admins.has(user.user.id)) return 3
  // user has 'ADMINISTRATOR'
  if (user.permissions.has(8) || user.guild.owner.user.id === user.user.id) return 2
  // user isnt special
  return 0
}
