import { Sticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  let stiker = false

  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/webp|image|video/g.test(mime) && !args[0]) {
      return conn.reply(m.chat, `
🍙 *Itsuki Nakano - Stickers* 🖼

*✨️ Onii-chan~ Responde a una imagen/video con .s 🪷*

> 🎨 ¡Hagámoslo juntos! 🎀
      `.trim(), m, ctxWarn)
    }

    await conn.reply(m.chat, '🍙🎨 *Creando tu sticker...* ⏳✨', m, ctxOk)

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime)) {
        if ((q.msg || q).seconds > 8) {
          return conn.reply(m.chat, '❌ *El video no puede durar más de 8 segundos*', m, ctxErr)
        }
      }

      let img = await q.download?.()
      if (!img) {
        return conn.reply(m.chat, '❌ *Error al descargar el archivo*', m, ctxErr)
      }

      try {
        // Usar sticker-creator (más moderno)
        const stickerOptions = {
          pack: 'ɪᴛsᴜᴋɪ ɴᴀᴋᴀɴᴏ sᴛᴋ',
          author: '𝙇𝙚𝙤 𝙓𝙯𝙯𝙨𝙮 👑',
          type: StickerTypes.FULL,
          categories: ['🎨', '✨'],
          quality: 50,
        }

        const sticker = new Sticker(img, stickerOptions)
        stiker = await sticker.toBuffer() // o .build() dependiendo de la versión

      } catch (e) {
        console.error(e)
        // Fallback a sharp si sticker-creator falla
        try {
          stiker = await sharp(img)
            .resize(512, 512, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp({ quality: 80 })
            .toBuffer()
        } catch (fallbackError) {
          return conn.reply(m.chat, '❌ *Error al crear el sticker*', m, ctxErr)
        }
      }

    } else if (args[0]) {
      if (isUrl(args[0])) {
        try {
          // Para URLs usar sticker-creator
          const stickerOptions = {
            pack: 'Itsuki Nakano',
            author: 'Tutora Virtual',
            type: StickerTypes.FULL,
            categories: ['🎨', '✨'],
            quality: 50,
          }

          const sticker = new Sticker(args[0], stickerOptions)
          stiker = await sticker.toBuffer()

        } catch (e) {
          console.error(e)
          return conn.reply(m.chat, '❌ *Error con la URL proporcionada*', m, ctxErr)
        }
      } else {
        return conn.reply(m.chat, '❌ *URL no válida*', m, ctxErr)
      }
    }

    if (stiker) {
      // Enviar el sticker
      await conn.sendMessage(m.chat, {
        sticker: stiker
      }, { quoted: m })

      await conn.reply(m.chat, 
        `🍙✅ *¡Sticker creado con éxito!* 🎨✨\n\n` +
        `🏷️ *Pack:* ɪᴛsᴜᴋɪ ɴᴀᴋᴀɴᴏ sᴛᴋ\n` +
        `✍️ *Autor:* 𝙇𝙚𝙤 𝙓𝙯𝙯𝙨𝙮 👑\n\n` +
        `📖 *"¡Tu sticker está listo para usar!"* 🍱🎉`,
        m, ctxOk
      )
    } else {
      return conn.reply(m.chat, '❌ *No se pudo crear el sticker*', m, ctxErr)
    }

  } catch (error) {
    console.error('Error en sticker:', error)
    await conn.reply(m.chat, 
      `❌ *Error al crear el sticker*\n\n` +
      `🍙 *"¡Lo siento! No pude crear tu sticker."*\n\n` +
      `🔧 *Error:* ${error.message}\n\n` +
      `📖 *¡Intenta con otro archivo!* 🍱✨`,
      m, ctxErr
    )
  }
}

handler.help = ['sticker', 's', 'stiker']
handler.tags = ['tools']
handler.command = ['s', 'sticker']

export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|webp)/, 'gi'))
}