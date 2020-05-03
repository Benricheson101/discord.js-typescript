import { PermissionResolvable, Message, Snowflake } from 'discord.js'
import DiscordClient from '@util/Client'
import { MongoClientOptions } from 'mongodb'

export type Nullable<T> = T | null

declare module 'discord.js' {
  export interface Guild {
    /** The guild's database document */
    db?: Promise<GuildDocument>
  }

  export interface GuildMember {
    client: DiscordClient
  }

  export interface ClientOptions {
    /** Bot admins */
    admins?: Set<Snowflake>
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
  /** Permission level required to use the command */
  level?: 0|1|2|3
  /** Where the command file is located. Set automatically. */
  filePath?: string
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

export type CommandFunction = (client?: DiscordClient, message?: Message, args?: string[]) => any | Promise<any>

export interface DatabaseOptions {
  name: string
  url: string
  options: MongoClientOptions
}

export interface GuildDocument {
  id: Snowflake
  config: {
    prefix: string
  }
}
