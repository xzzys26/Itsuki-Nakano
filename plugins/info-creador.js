import { existsSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } })

    const menuText = `👑 *CREADOR - 𝗟𝗲𝗼  𝘅𝘇𝘅𝘀𝘆 ⚡*\n\n𝗦𝗲𝗹𝗲𝗰𝗶𝗼𝗻𝗮 𝗨𝗻 𝗠𝗲𝘁𝗼𝗱𝗼:`

    const localImagePath = join(process.cwd(), 'src', 'image-owner.jpg')

    const nativeButtons = [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: '📸 ɪɴsᴛᴀɢʀᴀᴍ', 
          url: 'https://www.instagram.com/danxyb01' 
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: '👑 ᴄʀᴇᴀᴅᴏʀ', 
          url: 'https://wa.me/16503058299' 
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: '🌸 ᴅᴏɴᴀᴄɪᴏɴᴄɪᴛᴀ', 
          url: 'https://paypal.me/Erenxs01' 
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: '💎 ᴏʙᴛᴇɴ ɪᴛsᴜᴋɪ-ᴘʀᴇᴍ', 
          url: 'https://xzys-ultra.vercel.app' 
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: '🍉 ᴄᴀɴᴀʟ ᴏғɪᴄɪᴀʟ', 
          url: 'https://whatsapp.com/channel/0029VbBBn9R4NViep4KwCT3Z' 
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: '💎 ᴛɪᴋᴛᴏᴋ', 
          url: 'https://www.tiktok.com/@xzzys16' 
        })
      }
    ]

    // === Imagen opcional ===
    let header
    if (existsSync(localImagePath)) {
      const media = await prepareWAMessageMedia({ image: { url: localImagePath } }, { upload: conn.waUploadToServer })
      header = proto.Message.InteractiveMessage.Header.fromObject({
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      })
    } else {
      header = proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false })
    }

    // === Crear mensaje interactivo ===
    const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: menuText }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: '> 𝐈𝐭𝐬𝐮𝐤𝐢 𝐍𝐚𝐤𝐚𝐧𝐨-𝐈𝐀 𝐯2 🌸' }),
      header,
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: nativeButtons
      })
    })

    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.jid, quoted: m })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('❌ Error en el comando owner:', e)
    await conn.sendMessage(m.chat, {
      text: `❌ *Error al cargar la información del creador*\n\n🔗 Contacta directamente: https://wa.me/16503058299\n\n⚠️ *Error:* ${e.message}`
    }, { quoted: m })
  }
}

handler.help = ['owner', 'creador']
handler.tags = ['info']
handler.command = ['owner', 'creador', 'contacto']

export default handler