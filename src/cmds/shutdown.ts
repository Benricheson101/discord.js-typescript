import Command from '@command'
import * as chalk from 'chalk'

export default new Command({
  name: 'shutdown',
  aliases: ['stop'],
  adminLock: true
}, (client, message) => {
  console.log(chalk`{red [{bold I}] {bold Shutdown} initiated by {bold ${message.author.tag}} on ${new Date()}}`)
  client.db.close()
    .then(() => {
      console.log(chalk`{blue [{bold D}] Database connection {bold closed}}`)
      message.channel.send('🛑 Shutting down...')
        .then(() => {
          console.log(chalk`{red [{bold I}] {bold Stopping} process}`)
          process.exit(0)
        })
    })
})
