/* eslint @typescript-eslint/explicit-function-return-type: 'off' */
/* eslint @typescript-eslint/no-var-requires: 'off' */

import { promises, PathLike } from 'fs'
import { resolve, basename } from 'path'
import Client from './Client'
import Command from '@command'
import * as chalk from 'chalk'

/**
 * Recursively load files
 * @param {string} dir The root dir
 */
async function * fileloader (dir: string) {
  const files = await promises.readdir(dir, { withFileTypes: true })
  for (const file of files) {
    const res: PathLike = resolve(dir, file.name)
    if (file.isDirectory()) {
      yield * this(res)
    } else {
      yield res
    }
  }
}

/**
 * Load events from the events dir
 * @param {Client} client The Discord client
 * @param {string} eventsDir The dir containing the event files
 */
async function loadEvents (client: Client, eventsDir: string) {
  const files = fileloader(eventsDir)
  for await (const file of files) {
    if (!file.endsWith('.js')) continue

    const event = require(file)
    const eventName = basename(file).split('.')[0]

    client.on(eventName as any, event.bind(null, client))
    console.log(chalk`{green [{bold E}] Loaded {bold ${eventName}}}`)
  }
}

/**
 * Load all of the commands recursively
 * @param {Client} client The Discord client
 * @param {string} commandsRootDir The root commands directory
 */
async function loadCommands (client: Client, commandsRootDir: string): Promise<void> {
  const files = fileloader(commandsRootDir)
  for await (const file of files) {
    if (!file.endsWith('.js')) continue

    const command: Command = (await import(file)).default
    if (!(command instanceof Command)) continue

    if (!command.config.name) {
      console.error(chalk`{yellow [{bold C}] Command file {bold ${basename(file)}} does not contain a 'name' property so it was not loaded}`)
      continue
    }

    command.config.filePath = file
    client.commands.set(command.config.name, command)
    console.log(chalk`{magenta [{bold C}] Loaded {bold ${command.config.name}}}`)
  }
}

export {
  fileloader as default,
  loadEvents,
  loadCommands
}
