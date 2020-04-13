import Command from '@command'
import { Message } from 'discord.js'

export default new Command({
  name: 'ping',
  aliases: ['hello']
}, async (client, message) => {
  const pre: number = Date.now()
  const msg: Message = await message.channel.send('Pong!')
  await msg.edit(`:ping_pong: Websocket ping: ${client.ws.ping}ms | Bot latency: ${Date.now() - pre}ms`)
})
