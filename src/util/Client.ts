/* eslint @typescript-eslint/no-useless-constructor: 'off' */
import { Client, ClientOptions, Collection, Snowflake } from 'discord.js'
import Command from '@command'
import { Database } from './Database'

export default class extends Client {
  /**
   * The commands collection
   * Map<string, command>
   */
  commands: Collection<string, Command> = new Collection()
  /** The main database */
  db: any
  /** Bot administrators */
  admins: Snowflake[]

  constructor (options?: ClientOptions) {
    super(options)
    this.db = new Database(options.databases[0])
  }
}
