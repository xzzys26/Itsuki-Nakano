import { makeUserIdCard } from '../lib/registry.js'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  const db = global.db || { data: { users: {} } }
  const parsed = await Promise.resolve(conn.parseMention?.(m.text || ''))
  const mention0 = (Array.isArray(m.mentionedJid) && m.mentionedJid[0]) || (Array.isArray(parsed) && parsed[0])
  const rawTarget = mention0 || m?.quoted?.sender || m.sender
  const target = (conn.normalizeJid ? conn.normalizeJid(rawTarget) : rawTarget)
  const userObj = (db.data.users && db.data.users[target]) || {}

  const mentionedJid = [...new Set([m.sender, target].filter(Boolean).map(j => (conn.normalizeJid ? conn.normalizeJid(j) : j)))]

  const number = String(target || '').split('@')[0]
  let wName = ''
  try { wName = await Promise.resolve(conn.getName?.(target)) } catch {}
  const regName = (userObj?.registered && userObj?.name) ? userObj.name : ''
  const name = regName || wName || (target === m.sender ? (m.pushName) : '') || `@${number}`
  const age = userObj.age ?? null
  
  // OBTENER MONEDAS DE TODOS LOS CAMPOS POSIBLES
  const coin = userObj.coin ?? userObj.bank ?? userObj.yenes ?? userObj.money ?? userObj.moneda ?? 0
  
  let sn = userObj.sn
  if (!sn) {
    sn = 'SN-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
    try { if (db.data.users[target]) db.data.users[target].sn = sn } catch {}
  }

  let ppUrl = ''
  try { ppUrl = await conn.profilePictureUrl(target, 'image') } catch {}
  if (!ppUrl) ppUrl = 'https://files.catbox.moe/xr2m6u.jpg'

  const idCardBuf = await makeUserIdCard({ name, age, coin, sn, avatarUrl: ppUrl })

  const cardTitle = `Perfil de ${name}`
  const cardBody = [
    `• Número: wa.me/${number}`,
    `• Registrado: ${userObj.registered ? 'Sí' : 'No'}`,
    `• Nivel: ${userObj.level ?? 0}`,
    `• XP: ${userObj.exp ?? 0}`,
    `• Yenes: ${coin.toLocaleString()} ¥`,
    `• Banco: ${userObj.bank ?? coin}`
  ].join('\n')

  const tmp = path.join(process.cwd(), 'temp')
  try { fs.mkdirSync(tmp, { recursive: true }) } catch {}
  const cardPath = path.join(tmp, `perfil-${Date.now()}.png`)
  try { fs.writeFileSync(cardPath, idCardBuf) } catch {}

  const productMessage = {
    product: {
      productImage: { url: cardPath },
      title: cardTitle,
      description: cardBody,
      currencyCode: 'USD',
      priceAmount1000: 5000,
      retailerId: '1677',
      productId: '24526030470358430',
      productImageCount: 1
    },
    businessOwnerJid: target
  }

  const fkontak = await makeFkontak()

  await conn.sendMessage(
    m.chat,
    productMessage,
    { quoted: fkontak || m, contextInfo: { mentionedJid } }
  )
}

handler.help = ['perfil']
handler.tags = ['tools']
handler.command = /^perfil$/i
handler.exp = 5
handler.register = true

export default handler

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    const displayName = (typeof name !== 'undefined' && name) ? ` de ${name}` : ''
    return {
      key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: `Perfil${displayName}`, jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return null
  }
}