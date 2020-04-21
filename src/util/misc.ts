import { MessageEmbed, MessageReaction, User, ReactionCollector, Message } from 'discord.js'

//
// Extra functions that may or may not be useful.
// Feel free to delete this file if you aren't using it,
// none of these functions are required for the bot to function as is
//
// TOC:
// - Pagination
//

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
 * @returns {Promise<void>}
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
async function pages (message: Message, content: string[] | MessageEmbed[], options?: PageOptions): Promise<void> {
  if (!(content instanceof Array)) throw new TypeError('Content is not an array')
  if (!content.length) throw new Error('Content array is empty')

  let removeReaction = options.removeReaction ?? true

  if (!message.guild.me.permissions.has('MANAGE_MESSAGES')) removeReaction = false

  const emojis = {
    left: options.emojis.left ?? '⬅',
    end: options.emojis.end ?? '⏹',
    right: options.emojis.right ?? '➡'
  }

  const time = options.time ?? 300000
  const hideControlsSinglePage = options.hideControlsSinglePage ?? true
  const timeoutRemoveReactions = options.timeoutRemoveReactions ?? true

  if (hideControlsSinglePage && content.length === 1) {
    await message.channel.send(content instanceof MessageEmbed ? { embed: content[0] } : content[0])
    return
  }

  const filter = (reaction: MessageReaction, user: User): boolean => (Object.values(emojis).includes(reaction.emoji.name) || Object.values(emojis).includes(reaction.emoji.id)) && !user.bot && user.id === message.author.id
  let page: number = options.startPage || 0

  const msg = await message.channel.send(content[page] instanceof MessageEmbed ? { embed: content[page] } : content[page])

  for (const emoji in emojis) await msg.react(emojis[emoji])

  const collector: ReactionCollector = msg.createReactionCollector(filter, { time: time })

  collector.on('collect', ({ users, emoji: { id, name } }: MessageReaction, user: User) => {
    if (emojis.left && (id === emojis.left || name === emojis.left)) {
      page = page > 0 ? page - 1 : content.length - 1
      if (removeReaction) users.remove(user.id)
    } else if (emojis.right && (id === emojis.right || name === emojis.right)) {
      page = page + 1 < content.length ? page + 1 : 0
      if (removeReaction) users.remove(user.id)
    } else if (emojis.end && (id === emojis.end || name === emojis.end)) {
      if (msg) msg.delete()
      return
    }

    if (msg) {
      if (content[page] instanceof MessageEmbed) msg.edit({ embed: content[page] })
      else msg.edit(content[page])
    }
  })

  collector.on('end', () => {
    if (timeoutRemoveReactions) msg.reactions.removeAll()
  })
}

export {
  pages,
  PageOptions
}

//
// Types
// These types are in this file instead of `types/index.d` so they don't take up space if this file is deleted
//

interface PageOptions {
  emojis?: {
    left?: string
    end?: string
    right?: string
  }
  time?: number
  startPage?: number
  removeReaction?: boolean
  hideControlsSinglePage?: boolean
  timeoutRemoveReactions?: boolean
}
