let handler = async (m, { conn, usedPrefix }) => {
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Balance', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  
  const currency = global.currency || 'Yenes'

  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return conn.reply(m.chat, `🍙📚 *ITSUKI - Sistema de Economía*\n\n❌ Los comandos de economía están desactivados en este grupo\n\n*Administrador*, activa la economía con:\n${usedPrefix}economy on\n\n📖 "No puedo revisar tu balance si la economía está desactivada..."`, m, ctxErr)
  }

  let mentionedJid = await m.mentionedJid
  let who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : m.sender
  let name = await (async () => global.db.data.users[who].name || (async () => { 
    try { 
      const n = await conn.getName(who); 
      return typeof n === 'string' && n.trim() ? n : who.split('@')[0] 
    } catch { 
      return who.split('@')[0] 
    } 
  })())()

  if (!(who in global.db.data.users)) {
    return conn.reply(m.chat, `🍙❌ *ITSUKI - Usuario No Encontrado*\n\nEste usuario no está registrado en mi base de datos\n\n📚 "Debe usar el bot primero para registrarse..."`, m, ctxErr)
  }

  let user = global.db.data.users[who]
  let coin = user.coin || 0
  let bank = user.bank || 0
  let total = coin + bank

  const texto = `🍙💰 *ITSUKI NAKANO - Balance Económico* 📚✨

📖 *Información del Usuario:*
👤 Nombre: *${name}*

📊 *Estado Financiero:*
👛 Cartera: ¥${coin.toLocaleString()} ${currency}
🏦 Banco: ¥${bank.toLocaleString()} ${currency}
💴 Total: ¥${total.toLocaleString()} ${currency}

${coin > bank ? '⚠️ *Advertencia:* Tienes mucho dinero en tu cartera' : '✅ *Excelente:* Tu dinero está bien protegido'}

🍱 *Consejo de Itsuki:*
"Para proteger tu dinero, ¡deposítalo en el banco!"

📝 Usa: *${usedPrefix}deposit <cantidad>*
📚✨ "La administración del dinero es tan importante como el estudio"`

  await conn.reply(m.chat, texto, m, ctxOk)
}

handler.help = ['bal']
handler.tags = ['economy']
handler.command = ['bal', 'balance', 'bank'] 
handler.group = true 

export default handler