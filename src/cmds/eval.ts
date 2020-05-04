/* eslint prefer-promise-reject-errors: 0 */
import Command from '@command'
import { runInNewContext, RunningScriptOptions, Context } from 'vm'
import * as Discord from 'discord.js'
import { inspect } from 'util'
import { confirmation, captureOutput } from '@util/misc'
import * as chalk from 'chalk'

// TODO: allow codeblocks for code input?

export default new Command({
  name: 'eval',
  aliases: ['evaluate'],
  level: 3,
  help: {
    description: 'Execute JavaScript code',
    category: 'admin'
  }
}, async (client, message, args) => {
  if (!args[0]) return await message.channel.send(':x: You must provide code to execute!')

  const script: string = args.join(' ')

  if (!(
    await confirmation(
      message,
      new Discord.MessageEmbed()
        .setTitle(':warning: Are you sure you would like to execute the following code:')
        .setDescription('```js\n' + script + '```')
        .setColor(client.constants.colors.default),
      {
        denyMessage: 'Evaluation cancelled.',
        confirmMessage: 'Executing...',
        deleteAfterReaction: false
      }
    )
  )) return

  const context: Context = {
    client,
    message,
    args,
    Discord,
    console,
    require,
    process,
    global
  }

  const options: RunningScriptOptions = {
    filename: `${message.author.id}@${message.guild.id}`,
    timeout: 60000,
    displayErrors: true
  }

  const start: number = Date.now()
  let result: any = execute(`(async () => { ${script} })()`, context, options)

  if (!(await result)?.stdout && !(await result)?.callbackOutput && !(await result)?.stderr) {
    if (!(
      await confirmation(
        message,
        ':warning: Nothing was returned. Would you like to run the code again with implicit return?',
        {
          denyMessage: 'Cancelled.',
          confirmMessage: 'Rerunning code...',
          deleteAfterReaction: false
        }
      )
    )) return
    else result = execute(`(async () => ${script} )()`, context, options)
  }

  result
    .then(async (res: { stdout: string, stderr: string, callbackOutput: any }) => {
      console.log(chalk`{red {strikethrough -----} {bold Eval Output} {strikethrough -----}}`)
      console.log(res.callbackOutput)
      console.log(res.stdout)
      console.error(res.stderr)
      console.log(chalk`{red {strikethrough -----------------------}}`)

      message.channel.send({ embed: await generateEmbed(script, res, { start, end: Date.now() }) })
    })
})

async function execute (code: string, context: Context, options: object): Promise<{ stdout: string, stderr: string, callbackOutput?: any }> {
  return await new Promise((resolve, reject) => {
    try {
      captureOutput(() => runInNewContext(code, context, options))
        .then(resolve)
        .catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}

async function generateEmbed (code: string, outs: any, { start, end }: { start: number, end: number }): Promise<Discord.MessageEmbed> {
  const output = typeof outs?.callbackOutput?.then === 'function' ? await outs?.callbackOutput : outs?.callbackOutput
  const stdout = outs?.stdout
  const stderr = outs?.stderr

  const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
    .setFooter(`Execution time: ${end - start}ms`)
    .setTimestamp()

  if (output) {
    embed
      .setTitle(':outbox_tray: Output:')
      .setDescription('```js\n' + ((typeof output === 'string' ? output : inspect(output)) || 'undefined')?.substring(0, 2000) + '```')
  }

  if (stdout) embed.addField(':desktop: stdout', '```js\n' + ((typeof stdout === 'string' ? stdout : inspect(stdout)) || 'undefined')?.substring(0, 1000) + '```')

  if (stderr) embed.addField(':warning: stderr', '```js\n' + ((typeof stderr === 'string' ? stderr : inspect(stderr)) || 'undefined')?.substring(0, 1000) + '```')

  if (!embed.fields.length && !embed.description) embed.setTitle('Nothing was returned.')

  if ((stdout && !isError(outs?.callbackOutput)) || (stdout && !output) || (!stdout && !output && !stderr)) embed.setColor('GREEN')
  else if (!stdout && !output && stderr) embed.setColor('YELLOW')
  else embed.setColor(isError(output) ? 'RED' : 'GREEN')

  embed.addField('Input :inbox_tray:', '```js\n' + code.substring(0, 1000) + '```')

  return embed
}

function isError (object: object): boolean {
  const name = object?.constructor?.name
  if (!name) return true
  return /.*Error$/.test(name)
}
