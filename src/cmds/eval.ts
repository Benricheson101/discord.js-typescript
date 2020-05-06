import Command from '@command'
import { runInNewContext, RunningScriptOptions, Context } from 'vm'
import * as Discord from 'discord.js'
import { inspect } from 'util'
import { confirmation, captureOutput, matchString } from '@util/misc'
import * as chalk from 'chalk'
import fetch from 'node-fetch'

const options: any = {
  callback: false,
  stdout: true,
  stderr: true
}

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

  const script: string = parseCodeblock(args.join(' '))

  if (!(
    await confirmation(
      message,
      new Discord.MessageEmbed()
        .setTitle(':warning: Are you sure you would like to execute the following code:')
        .setDescription('```js\n' + script + '```')
        .setColor(client.constants.colors.default),
      {
        deleteAfterReaction: true
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

  const scriptOptions: RunningScriptOptions = {
    filename: `${message.author.id}@${message.guild.id}`,
    timeout: 60000,
    displayErrors: true
  }

  let start: number = Date.now()
  let result: any = execute(`'use strict'; (async () => { ${script} })()`, context, scriptOptions)
  let end: number = Date.now()

  if (!(await result)?.stdout && !(await result)?.callbackOutput && !(await result)?.stderr) {
    if (!(
      await confirmation(
        message,
        ':warning: Nothing was returned. Would you like to run the code again with implicit return?',
        {
          deleteAfterReaction: true
        }
      )
    )) return
    else {
      start = Date.now()
      result = execute(`'use strict'; (async () => ${script} )()`, context, scriptOptions)
      end = Date.now()
    }
  }

  interface Output { stdout: string, stderr: string, callbackOutput: any }
  result
    .then(async (res: Output) => {
      if (
        (options.stdout && res?.stdout) ||
        (options.stderr && res?.stderr) ||
        (options.callback && res?.callbackOutput)
      ) {
        console.log(chalk`{red {strikethrough -}[ {bold Eval Output} ]{strikethrough ---------}}`)
        if (options.callback && res.callbackOutput) console.log(res.callbackOutput)

        if (options.stdout && res.stdout) {
          console.log(chalk`{red {strikethrough -}[ {bold stdout} ]{strikethrough --------------}}`)
          console.log(res.stdout)
        }
        if (options.stderr && res.stderr) {
          console.log(chalk`{red {strikethrough -}[ {bold stderr} ]{strikethrough --------------}}`)
          console.error(res.stderr)
        }
        console.log(chalk`{red {strikethrough -}[ {bold End} ]{strikethrough -----------------}}`)
      }

      if (
        matchString(client.token, inspect(res.callbackOutput).split(' '), { minRating: 0.6 }) ||
        matchString(client.token, inspect(res.stdout).split(' '), { minRating: 0.6 }) ||
        matchString(client.token, inspect(res.stderr).split(' '), { minRating: 0.6 })
      ) {
        if (!(
          await confirmation(
            message,
            ':bangbang: The bot token is likely located somewhere in the output of your code. Would you like to display the output?',
            {
              deleteAfterReaction: true
            }
          )
        )) return
      }
      const embed: Discord.MessageEmbed = await generateEmbed(script, res, { start, end })
      const msg = await message.channel.send({ embed: embed })

      if (!(
        await confirmation(
          message,
          ':information_source: Would you like to post the output of this command on hastebin?',
          {
            deleteAfterReaction: true
          }
        )
      )) return

      const evalOutput: string[] = []

      if (res.callbackOutput) {
        evalOutput.push(
          '-[ Eval Output ]---------',
          typeof res.callbackOutput === 'string' ? res.callbackOutput : inspect(res.callbackOutput)
        )
      }

      if (res.stdout) {
        evalOutput.push(
          '-[ stdout ]--------------',
          typeof res.stdout === 'string' ? res.stdout : inspect(res.stdout)
        )
      }

      if (res.stderr) {
        evalOutput.push(
          '-[ stderr ]--------------',
          typeof res.stderr === 'string' ? res.stderr : inspect(res.stderr)
        )
      }

      const body = await fetch('https://hastebin.com/documents', {
        method: 'post',
        body: evalOutput.join('\n')
      })
        .then(async (res) => await res.json())

      await msg.edit({ embed: embed.addField(':notepad_spiral: Hastebin', `https://hastebin.com/${body.key as string}`) })
    })
})

async function execute (code: string, context: Context, options: object): Promise<{ stdout: string, stderr: string, callbackOutput?: any }> {
  return await new Promise((resolve) => {
    try {
      captureOutput(() => runInNewContext(code, context, options))
        .then(resolve)
        .catch(resolve)
    } catch (err) {
      resolve(err)
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

  embed.addField(':inbox_tray: Input', '```js\n' + code.substring(0, 1000) + '```')

  return embed
}

function isError (object: object): boolean {
  const name = object?.constructor?.name
  if (!name) return true
  return /.*Error$/.test(name)
}

// Code from: https://github.com/lifeguardbot/lifeguard/blob/a31f57b5164d95d16f0dd961c10a5b77dc9e7bd4/src/plugins/dev/eval.ts#L6-L13
function parseCodeblock (script: string): string {
  const cbr = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm
  const result = cbr.exec(script)
  if (result) {
    return result[4]
  }
  return script
}
