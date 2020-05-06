import {
  MessageEmbed,
  MessageReaction,
  User,
  ReactionCollector,
  Message
} from 'discord.js'

import {
  findBestMatch
} from 'string-similarity'

import {
  promisify
} from 'util'

//
// Extra functions that may or may not be useful.
// Feel free to delete functions from this file if you aren't using them,
// none of these functions are required for the bot to function, but a few may be used in the existing commands
//
// confirmation:
// - cmds/reload.ts
// - cmds/shutdown.ts
//
// captureOutput:
// - cmds/eval.ts
//
// If you delete this file, you can uninstall the following packages:
// - string-similarity
// - @types/string-similarity
//
// TOC:
// - Wait function
// - Pagination
// - Find nearest-matching string from array
// - Confirmation
// - Capture stdout and stderr that would be written from a callback funciton
//

/**
 * Super basic but very useful sometimes. Basically a pause function for using with async/await
 * @example
 * message.channel.send('Hello')
 * await wait(5000)
 * message.channel.send('Hi')
 */
export const wait = promisify(setTimeout)

/**
 * Paginate a message
 * @param {Message} message Discord.js Messsage object
 * @param {string[] | MessageEmbed[]} content The text to paginate
 * @param {PageOptions} [options] Options for pagination
 * @param {object} [options.emojis] Emojis to use for controls
 * @param {string} [options.emojis.left='⬅'] The emoji used for going to the previous page
 * @param {string} [options.emojis.end='⏹'] The emoji used for deleting the message
 * @param {string} [options.emojis.right='➡'] The emoji used for going to the next page
 * @param {number} [options.time=300000] How long to 'watch' for reactions
 * @param {number} [options.startPage=0] Which page to start on (counting starts at 0)
 * @param {boolean} [options.removeReaction=true] Remove user's reaction (note: the bot must have `MANAGE_MESSAGES`)
 * @param {boolean} [options.hideControlsSinglePage=true] Hide the controls if there is only one page
 * @param {boolean} [options.timeoutRemoveReactions=true] Remove the reactions after the time expires
 * @param {boolean} [options.keepOnStop] Keep the message after stopping the reaction collector
 * @param {boolean} [options.jump5] If there are more than 5 pages, should there be an optionto skip 5 pages at a time?
 * @returns {Promise<number>}
 * @example
 * const content: string[] = ['First page', 'Second page', 'Third page']
 *
 * const options: PageOptions = {
 *   time: 150000,
 *   startPage: 2
 * }
 *
 * pages(message, content, options)
*/
async function pages (message: Message, content: string[] | MessageEmbed[] | Array<string | MessageEmbed>, options?: PageOptions): Promise<number> {
  return await new Promise(async (resolve) => {
    if (!(content instanceof Array)) throw new TypeError('Content is not an array')
    if (!content.length) throw new Error('Content array is empty')

    let removeReaction = options?.removeReaction ?? true

    if (!message.guild.me.permissions.has('MANAGE_MESSAGES')) removeReaction = false

    const emojis = {
      left5: '⏪',
      left: options?.emojis?.left ?? '⬅',
      end: options?.emojis?.end ?? '⏹',
      right: options?.emojis?.right ?? '➡',
      right5: '⏩'
    }

    const time = options?.time ?? 300000
    const hideControlsSinglePage = options?.hideControlsSinglePage ?? true
    const timeoutRemoveReactions = options?.timeoutRemoveReactions ?? true

    const jump5 = (options?.jump5 && content.length > 5) ?? content.length > 5

    if (hideControlsSinglePage && content.length === 1) {
      message.channel.send(content instanceof MessageEmbed ? { embed: content[0] } : content[0])
      resolve(0)
      return
    }

    const filter = (reaction: MessageReaction, user: User): boolean => (Object.values(emojis).includes(reaction.emoji.name) || Object.values(emojis).includes(reaction.emoji.id)) && !user.bot && user.id === message.author.id
    let page: number = options?.startPage || 0

    const msg = await message.channel.send(content[page] instanceof MessageEmbed ? { embed: content[page] } : content[page])

    if (jump5) await msg.react(emojis.left5)
    await msg.react(emojis.left)
    await msg.react(emojis.end)
    await msg.react(emojis.right)
    if (jump5) await msg.react(emojis.right5)

    const collector: ReactionCollector = msg.createReactionCollector(filter, { time: time })

    collector.on('collect', ({ users, emoji: { id, name } }: MessageReaction, user: User) => {
      if (emojis.left && (id === emojis.left || name === emojis.left)) {
        page = page > 0 ? page - 1 : content.length - 1
        if (removeReaction) users.remove(user.id)
      } else if (emojis.right && (id === emojis.right || name === emojis.right)) {
        page = page + 1 < content.length ? page + 1 : 0
        if (removeReaction) users.remove(user.id)
      } else if (emojis.end && (id === emojis.end || name === emojis.end)) {
        collector.stop()
        return
      } else if (jump5 && emojis.left5 && (id === emojis.left5 || name === emojis.left5)) {
        page = page - 5 < 0 ? content.length - (Math.abs(page - 5)) : page - 5
        if (removeReaction) users.remove(user.id)
      } else if (jump5 && emojis.right5 && (id === emojis.right5 || name === emojis.right5)) {
        page = page + 5 > (content.length - 1) ? (page + 5) - content.length : page + 5
        if (removeReaction) users.remove(user.id)
      }

      if (msg) {
        if (content[page] instanceof MessageEmbed) msg.edit({ embed: content[page] })
        else msg.edit(content[page], { embed: null })
      }
    })

    collector.on('end', (_, reason) => {
      if (!options?.keepOnStop) msg.delete()
      if (timeoutRemoveReactions && options?.keepOnStop) msg.reactions.removeAll()
      if (reason !== 'time') resolve(page)
    })
  })
}

/**
 * Find the closest matching string from an array
 * @param {string} search The string to compare
 * @param {string[]} mainStrings The strings to find the closest match in
 * @returns {string | null}
 * @example
 * const search: string = 'Admin'
 * const strings: string[] = ['Administrator', 'Developer', 'Moderator']
 * const options: MatchStringOptions = { minRating: 0.4 }
 *
 * const match: string | null = matchString(search, strings, options)
 * // match: 'Administrator'
 */
function matchString (search: string, mainStrings?: string[], ops?: MatchStringOptions): string | null {
  const { bestMatchIndex, bestMatch: { rating } } = findBestMatch(search, mainStrings)

  if (rating < ops?.minRating) return null

  return mainStrings[bestMatchIndex]
}

/**
 * Ask for confirmation before proceeding
 * @param {Message} message Discord.js message object
 * @param {string} confirmationMessage Ask for confirmation
 * @param {ConfirmationOptions} [options] Options
 * @param {string} [options.confirmMessage] Edit the message upon confirmation
 * @param {string | MessageEmbed} [options.denyMessage] Edit the message upon denial
 * @param {number} options.time Timeout
 * @param {boolean} [options.keepReactions] Keep reactions after reacting
 * @param {boolean} [options.deleteAfterReaction] Delete the message after reaction (takes priority over all other messages)
 * @example
 * const confirmationMessage: string = 'Are you sure you would like to stop the bot?'
 * const options: ConfirmationOptions = {
 *   confirmMessage: 'Shutting down...',
 *   denyMessage: 'Shutdown cancelled.'
 * }
 *
 * const proceed: boolean = await confirmation(message, confirmationMessage, options)
 *
 * if (proceed) process.exit(0)
 */
async function confirmation (message: Message, confirmationMessage: string | MessageEmbed, options?: ConfirmationOptions): Promise<boolean> {
  const yesReaction = '✔️'
  const noReaction = '✖️'

  const filter = ({ emoji: { name } }: MessageReaction, { id }: User): boolean => (name === yesReaction || name === noReaction) && id === message.author.id

  const msg = await message.channel.send(confirmationMessage)

  await msg.react(yesReaction)
  await msg.react(noReaction)

  const e = (await msg.awaitReactions(filter, { max: 1, time: options?.time ?? 300000 })).first()

  if (options?.deleteAfterReaction) msg.delete()
  else if (!options?.keepReactions) msg.reactions.removeAll()

  if (e?.emoji?.name === yesReaction) {
    if (options?.confirmMessage && !options?.deleteAfterReaction) await msg.edit(options?.confirmMessage instanceof MessageEmbed ? { embed: options?.confirmMessage, content: null } : { embed: null, content: options?.confirmMessage })
    return true
  } else {
    if (options?.denyMessage && !options?.deleteAfterReaction) await msg.edit(options?.denyMessage instanceof MessageEmbed ? { embed: options?.denyMessage, content: null } : { embed: null, content: options?.denyMessage })
    return false
  }
}

/**
 * Capture stdout and stderr while executing a function
 * @param {Function} callback The callback function to execute
 * @returns {Promise<CapturedOutput>} stdout, stderr and callback outputs
 */
async function captureOutput (callback: Function): Promise<CapturedOutput> {
  return await new Promise((resolve, reject) => {
    const oldProcess = { ...process }
    let stdout = ''
    let stderr = ''

    // overwrite stdout write function
    process.stdout.write = (str: string) => {
      stdout += str
      return true
    }

    // overwrite stderr write function
    process.stderr.write = (str: string) => {
      stderr += str
      return true
    }

    try {
      const c = callback()

      delete process.stdout.write
      process.stdout.write = oldProcess.stdout.write

      delete process.stderr.write
      process.stderr.write = oldProcess.stderr.write

      return c
        .catch((c: Error) => reject({ stdout, stderr, callbackOutput: c })) // eslint-disable-line prefer-promise-reject-errors
        .then((callbackOutput: any) => resolve({ stdout, stderr, callbackOutput }))
    } catch (error) {
      delete process.stdout.write
      process.stdout.write = oldProcess.stdout.write

      delete process.stderr.write
      process.stderr.write = oldProcess.stderr.write
      return reject({ stdout, stderr, callbackOutput: error }) // eslint-disable-line prefer-promise-reject-errors
    }
  })
}

export {
  pages,
  PageOptions,

  matchString,
  MatchStringOptions,

  confirmation,
  ConfirmationOptions,

  captureOutput,
  CapturedOutput
}

//
// Types
// These types are in this file instead of `types/index.d` so they don't take up space if this file is deleted
//

interface PageOptions {
  /** Emojis to use for page controls */
  emojis?: {
    /** Previous page */
    left?: string
    /** Delete the message, stop watching for reactions */
    end?: string
    /** Next page */
    right?: string
  }
  /** Timeout */
  time?: number
  /** Which page to start on. Starts with 0 */
  startPage?: number
  /** Remove the user's reaction after they add one. Requires the bot to have 'MANAGE_MESSAGES' */
  removeReaction?: boolean
  /** Hide controls if there is only one page */
  hideControlsSinglePage?: boolean
  /** Remove reactions after time expires */
  timeoutRemoveReactions?: boolean
  /** Add buttons to jump 5 pages (if there is over 5 pages) */
  jump5?: boolean
  /** Should the stop button keep the message? */
  keepOnStop?: boolean
}

interface MatchStringOptions {
  /** Only return a string if it is a certain % similar */
  minRating?: number
}

interface ConfirmationOptions {
  /** Edit the message after confirming */
  confirmMessage?: string | MessageEmbed
  /** Edit the message after denying */
  denyMessage?: string | MessageEmbed
  /** Delete the message after receiving a reaction */
  deleteAfterReaction?: boolean
  /** Timeout */
  time?: number
  /** Keep the reactions upon reacting */
  keepReactions?: boolean
}

interface CapturedOutput {
  stdout: string
  stderr: string
  callbackOutput: any
}
