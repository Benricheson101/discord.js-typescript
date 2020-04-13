import 'module-alias/register'
import Client from '@util/Client'
import { token, clientOptions } from './setup'
import { loadEvents, loadCommands } from '@util/fileloader'

const client = new Client(clientOptions)

loadEvents(client, 'build/events')
loadCommands(client, 'build/cmds')

client.db.connect()
  .then(() => console.log('[D] Connected to MongoDB!'))
  .catch(console.error)

client.login(token)
  .catch(console.error)
