import { Structures } from 'discord.js'
import Client from '@util/Client'

Structures.extend('Guild', (Guild) => {
  return class extends Guild {
    _client: Client

    constructor (client: Client, data: any) {
      super(client, data)
      this._client = client
    }

    get db (): Promise<any> {
      return this._client.db.guilds.findOne({ id: this.id })
    }
  }
})
