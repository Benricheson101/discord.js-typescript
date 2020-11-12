import Command from '@command'

export default new Command({
  name: 'ping',
  aliases: ['hello'],
  help: {
    category: 'other'
  }
}, async (client, message) => {
  const pre: number = Date.now()
  const msg = await message.channel.send('Pong!')
  await msg.edit(`:ping_pong: Websocket ping: ${client.ws.ping}ms | Message sent in: ${Date.now() - pre}ms`)
})
