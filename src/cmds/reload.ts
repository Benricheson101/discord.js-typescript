/* eslint @typescript-eslint/no-dynamic-delete: 0, @typescript-eslint/no-var-requires: 0 */
import Command from '@command'
import { confirmation } from '@util/misc'

export default new Command({
  name: 'reload',
  level: 3,
  help: {
    description: 'Reload a command',
    category: 'admin'
  }
}, async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must include a command to reload!')

  let commands: Command[] = []
  if (args[0].toLowerCase() === 'all') {
    commands = client.commands.array()
  } else {
    for (const command of args) {
      const cmd: Command = client.commands.find(({ config }) => config.name === command || config?.aliases?.includes(command))
      if (cmd) commands.push(cmd)
    }
  }

  if (!commands.length) return await message.channel.send(':x: No commands found')

  const confirmationMsg: string = `:warning: Are you sure you would like to reload the following ${commands.length === 1 ? 'command' : 'commands'}:
${commands.map(({ config: { name } }) => `> \`${name}\``).join('\n')}`

  if (!(await confirmation(message, confirmationMsg, { confirmMessage: ':gear: Working...', denyMessage: ':hammer: Cancelled.' }))) return

  const finished: Command[] = []
  for (const { config: { name, filePath } } of commands) {
    client.commands.delete(name)
    delete require.cache[require.resolve(filePath)]

    const c: Command = (await import(filePath)).default
    c.config.filePath = filePath
    client.commands.set(c.config.name, c)

    finished.push(c)
  }

  message.channel.send(`:white_check_mark: Reloaded:
${finished.map(({ config: { name } }) => `> \`${name}\``).join('\n') || '> `none`'}`)
})
