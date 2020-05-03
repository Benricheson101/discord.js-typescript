import '@util/dotenv'
import { GuildDocument } from '@types'
import { ClientOptions, Snowflake } from 'discord.js'

export const token = process.env.TOKEN

export const constants = {
  name: 'ts-bot',
  prefix: '/',
  colors: {
    default: '#286ece'
  },
  errors: {
    generic: ':x: An error occurred.'
  }
}

/**
 * Make a new guild document
 * @param {Snowflake} id The guild's id
 */
export function defaultGuildDocument (id: Snowflake): GuildDocument {
  return {
    id: id,
    config: {
      prefix: constants.prefix
    }
  }
}

export const clientOptions: ClientOptions = {
  disableMentions: 'all',
  startupCooldown: 5000,
  databases: [{
    name: constants.name,
    url: `mongodb://localhost/${constants.name.replace(' ', '-')}`,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }]
}
