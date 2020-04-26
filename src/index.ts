import 'module-alias/register'
import Client from '@util/Client'
import { token, clientOptions } from './setup'

new Client(clientOptions)
  .login(token)
  .catch(console.error)
