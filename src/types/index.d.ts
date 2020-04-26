import { PermissionResolvable, Message, Snowflake } from 'discord.js'
import Client from '@util/Client'
import { MongoClientOptions } from 'mongodb'

declare module 'discord.js' {
  export interface Guild {
    /** The guild's database document (if there is one) */
    db: Promise<GuildDocument>
  }

  export interface ClientOptions {
    /** Bot admins */
    admins: Snowflake[]
    /** Databases */
    databases: DatabaseOptions[]
    /** Cooldown upon starting the bot */
    startupCooldown?: number
    /** Permissions the bot requires to function */
    permissions?: PermissionResolvable[]
  }
}

export interface CommandOptions {
  /** The command name */
  name: string
  /** Command aliases */
  aliases?: string[]
  /** Disable the command */
  disabled?: boolean
  /** Only allow bot admins to use a command */
  adminLock?: boolean
  /** Info for the help command */
  help?: {
    /** A description of the command */
    description?: string
    /** What category the command is in */
    category?: string
    /** Hide the command from the help command */
    hidden?: boolean
    /** User permissions */
    userPermissions?: PermissionResolvable
    /** Command usage */
    usage?: string
  }
}

export type CommandFunction = (client?: Client, message?: Message, args?: string[]) => any | void | Promise<void> | Promise<any>

export interface DatabaseOptions {
  name: string
  url: string
  clientOptions: MongoClientOptions
}

export interface GuildDocument {
  id: Snowflake
  config: {
    prefix: string
  }
}
