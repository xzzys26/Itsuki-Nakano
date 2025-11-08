import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxOk = (global.rcanalr || {})

  if (!text) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.reply(m.chat, `☕️ *Debes escribir tu modelo y tu pregunta*\nEjemplo: gpt-5-nano ¿Hola?`, m, ctxErr)
  }

  let args = text.split(' ')
  let model = args.shift().toLowerCase()
  const question = args.join(' ')

  const modelosDisponibles = ['gpt-5-nano', 'claude', 'gemini', 'deepseek', 'grok', 'meta-ai', 'qwen']

  if (!modelosDisponibles.includes(model)) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.reply(m.chat, `🤖 *Modelo inválido*\nModelos disponibles: ${modelosDisponibles.join(', ')}`, m, ctxErr)
  }

  if (!question) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    return conn.reply(m.chat, `☕️ *Escribe tu pregunta después del modelo*`, m, ctxErr)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '💭', key: m.key } })
    await conn.sendPresenceUpdate('composing', m.chat)

    const response = await fetch(`https://api-adonix.ultraplus.click/ai/chat?apikey=${global.apikey}&q=${encodeURIComponent(question)}&model=${model}`)
    const data = await response.json()

    if (!data.status || !data.reply) throw new Error('No se recibió respuesta de la API')

    await conn.reply(m.chat, data.reply, m, ctxOk)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    conn.reply(m.chat, `❌️ *Error:* ${err.message}`, m, ctxErr)
  }
}

handler.help = ["ia", "ai"]
handler.tags = ["ai"]
handler.command = ["ia", "ai", "itsuki"]

export default handler