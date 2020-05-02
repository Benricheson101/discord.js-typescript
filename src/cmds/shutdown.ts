import Command from '@command'
import * as chalk from 'chalk'
import { confirmation } from '@util/misc'

export default new Command({
  name: 'shutdown',
  aliases: ['stop'],
  adminLock: true
}, async (client, message) => {
  const question: string = ':warning: Are you sure you would like to stop the bot?'
  const yes: string = 'Shutting down...'
  const no: string = 'Shutdown cancelled.'

  if (!(await confirmation(message, question, { confirmMessage: yes, denyMessage: no }))) return
  console.log(chalk`{red [{bold I}] {bold Shutdown} initiated by {bold ${message.author.tag}} on ${new Date()}}`)
  console.log(chalk`{red [{bold I}] {bold Stopping} process}`)
  process.exit(0)
})
