/* eslint @typescript-eslint/no-useless-constructor: 'off' */
import { Client, ClientOptions, Collection, Snowflake, MessageEmbed } from 'discord.js'
import Command from '@command'
import { Database } from '@util/Database'
import { constants } from '../setup'

export default class extends Client {
  /**
   * The commands collection
   * Map<string, command>
   */
  commands: Collection<string, Command> = new Collection()
  /** The main database */
  db
  /** Bot administrators */
  admins: Snowflake[]
  /** Constants */
  constants = constants

  constructor (options?: ClientOptions) {
    super(options)
    this.db = new Database(options.databases[0])
  }

  /**
   * Default embed
   * @param {MessageEmbed} [embed] Discord.js's MessageEmbed takes an embed as a param
   */
  defaultEmbed (embed?: MessageEmbed): MessageEmbed {
    return new MessageEmbed(embed)
      .setColor(this.constants.colors.default)
  }
}
