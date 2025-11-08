// * * * Adaptación: Itsuki Nakano AI
// * * * Base: Sunaookami Shiroko (S.D.D) Ltc.

import { existsSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const okReact = global.rcanalr?.text || global.rcanalr || '🎃'
    const errReact = global.rcanalx?.text || global.rcanalx || '❌'

    let help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : p.help ? [p.help] : [],
        tags: Array.isArray(p.tags) ? p.tags : p.tags ? [p.tags] : [],
      }))

    let menuText = `> Ꮺׄ ㅤდㅤ   *ɪᴛsᴜᴋɪ* ㅤ 𖹭𑩙
> ୨ㅤ   ֵ      *݊ɴᴀᴋᴀɴᴏV2* ㅤ ׄㅤ  ꨄ︎

`

    const categories = {
      '*NAKANO-INFO*': ['main', 'info'],
      '*INTELIGENCIA*': ['bots', 'ia'],
      '*JUEGOS*': ['game', 'gacha'],
      '*ECONOMÍA*': ['economy', 'rpgnk'],
      '*GRUPOS*': ['group'],
      '*DESCARGAS*': ['downloader'],
      '*MULTIMEDIA*': ['sticker', 'audio', 'anime'],
      '*TOOLS*': ['tools', 'advanced'],
      '*BÚSQUEDA*': ['search', 'buscador'],
      '*NK-PREM*': ['fun', 'premium', 'social', 'custom'],
      '*NK-OWNER*': ['owner', 'creador'],
    }

    for (let catName in categories) {
      let catTags = categories[catName]
      let comandos = help.filter(menu => menu.tags.some(tag => catTags.includes(tag)))

      if (comandos.length) {
        menuText += `꒰⌢ ʚ˚₊‧ ✎ ꒱ ❐ ${catName} ❐\n`
        let uniqueCommands = [...new Set(comandos.flatMap(menu => menu.help))]
        for (let cmd of uniqueCommands) {
          menuText += `> ੭੭ ﹙ᰔᩚ﹚ ❏ \`\`\`${_p}${cmd}\`\`\`\n`
        }
        menuText += `> .・。.・゜✭・.・✫・゜・。.\n\n`
      }
    }

    menuText += `*‐ ダ mᥲძᥱ ᑲᥡ ʟᴇᴏ xᴢᴢsʏ ᴏғᴄ 👑*`

    await conn.sendMessage(m.chat, { react: { text: okReact, key: m.key } })

    const localImagePath = join(process.cwd(), 'src', 'menu.jpg')
    let header

    if (existsSync(localImagePath)) {
      const media = await prepareWAMessageMedia(
        { image: { url: localImagePath } },
        { upload: conn.waUploadToServer }
      )
      header = proto.Message.InteractiveMessage.Header.fromObject({
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      })
    } else {
      header = proto.Message.InteractiveMessage.Header.fromObject({
        hasMediaAttachment: false
      })
    }

    const nativeButtons = [
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
      }
    ]

    const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: menuText }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: '> 𝐈𝐭𝐬𝐮𝐤𝐢 𝐍𝐚𝐤𝐚𝐧𝐨-𝐈𝐀 𝐯2 🌸'
      }),
      header,
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: nativeButtons
      })
    })

    const msg = generateWAMessageFromContent(
      m.chat,
      { interactiveMessage },
      { userJid: conn.user.jid, quoted: m }
    )

    // 🌸 Simula que el mensaje fue reenviado desde el canal
    if (global.rcanalr) {
      msg.key.participant = global.rcanalr
      msg.key.remoteJid = 'status@broadcast'
      msg.key.fromMe = false
    }

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('❌ Error en el menú:', e)
    await conn.sendMessage(
      m.chat,
      {
        text: `🍙 *ITSUNI MENÚ BÁSICO*\n\n• ${_p}menu - Menú principal\n• ${_p}ping - Estado del bot\n• ${_p}prefijos - Ver prefijos\n\n⚠️ *Error:* ${e.message}`
      },
      { quoted: m }
    )
  }
}

handler.help = ['menu', 'menunakano', 'help', 'menuitsuki']
handler.tags = ['main']
handler.command = ['men1', 'menu1', 'help']

export default handler