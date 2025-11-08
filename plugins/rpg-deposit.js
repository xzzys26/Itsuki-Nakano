let handler = async (m, { conn, args, usedPrefix, command }) => {
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Depósito', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  
  const currency = global.currency || 'Yenes'

  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return conn.reply(m.chat, `🍙📚 *ITSUKI - Sistema de Economía*\n\n❌ Los comandos de economía están desactivados en este grupo\n\n*Administrador*, activa la economía con:\n${usedPrefix}economy on\n\n📖 "No puedo gestionar depósitos si la economía está desactivada..."`, m, ctxErr)
  }

  let user = global.db.data.users[m.sender]

  if (!args[0]) {
    return conn.reply(m.chat, `🍙💰 *ITSUKI - Depósito Bancario*\n\n❌ Debes especificar una cantidad\n\n📝 *Uso correcto:*\n• ${usedPrefix}${command} <cantidad>\n• ${usedPrefix}${command} all\n\n💡 *Ejemplos:*\n• ${usedPrefix}${command} 5000\n• ${usedPrefix}${command} all\n\n📚 "Especifica cuánto deseas depositar..."`, m, ctxWarn)
  }

  if ((args[0]) < 1) {
    return conn.reply(m.chat, `🍙❌ *ITSUKI - Cantidad Inválida*\n\n⚠️ La cantidad debe ser mayor a 0\n\n📚 "No puedes depositar una cantidad negativa o cero..."`, m, ctxErr)
  }

  if (args[0] == 'all') {
    let count = parseInt(user.coin)
    
    if (count <= 0 || !user.coin) {
      return conn.reply(m.chat, `🍙💸 *ITSUKI - Sin Fondos*\n\n❌ No tienes ${currency} en tu cartera\n\n👛 *Cartera:* ¥0 ${currency}\n\n📚 "Necesitas trabajar primero para ganar dinero..."\n\n💡 Usa: *${usedPrefix}work*`, m, ctxErr)
    }

    user.coin -= count * 1
    user.bank += count * 1

    await conn.reply(m.chat, `🍙🏦 *ITSUKI - Depósito Completo* 📚✨\n\n✅ Has depositado todo tu dinero\n\n💰 *Monto depositado:*\n¥${count.toLocaleString()} ${currency}\n\n🏦 *Nuevo balance en banco:*\n¥${user.bank.toLocaleString()} ${currency}\n\n👛 *Cartera actual:*\n¥${user.coin.toLocaleString()} ${currency}\n\n🔒 "¡Excelente decisión! Tu dinero está seguro en el banco"\n📚✨ "Nadie podrá robártelo ahora"`, m, ctxOk)
    return !0
  }

  if (!Number(args[0])) {
    return conn.reply(m.chat, `🍙❌ *ITSUKI - Formato Incorrecto*\n\n⚠️ Debes ingresar un número válido\n\n📝 *Ejemplos correctos:*\n• ${usedPrefix}${command} 25000\n• ${usedPrefix}${command} all\n\n📚 "Asegúrate de escribir solo números..."`, m, ctxErr)
  }

  let count = parseInt(args[0])

  if (!user.coin) {
    return conn.reply(m.chat, `🍙💸 *ITSUKI - Sin Fondos*\n\n❌ No tienes ${currency} en tu cartera\n\n👛 *Cartera:* ¥0 ${currency}\n\n📚 "Necesitas trabajar primero para ganar dinero..."\n\n💡 Usa: *${usedPrefix}work*`, m, ctxErr)
  }

  if (user.coin < count) {
    return conn.reply(m.chat, `🍙⚠️ *ITSUKI - Fondos Insuficientes*\n\n❌ No tienes suficiente dinero\n\n👛 *Dinero en cartera:*\n¥${user.coin.toLocaleString()} ${currency}\n\n💰 *Intentaste depositar:*\n¥${count.toLocaleString()} ${currency}\n\n📚 "Solo puedes depositar el dinero que tienes en tu cartera..."\n\n💡 Usa: *${usedPrefix}${command} all* para depositar todo`, m, ctxWarn)
  }

  user.coin -= count * 1
  user.bank += count * 1

  await conn.reply(m.chat, `🍙🏦 *ITSUKI - Depósito Exitoso* 📚✨\n\n✅ Depósito realizado correctamente\n\n💰 *Monto depositado:*\n¥${count.toLocaleString()} ${currency}\n\n📊 *Resumen financiero:*\n👛 Cartera: ¥${user.coin.toLocaleString()} ${currency}\n🏦 Banco: ¥${user.bank.toLocaleString()} ${currency}\n💎 Total: ¥${(user.coin + user.bank).toLocaleString()} ${currency}\n\n🔒 "¡Perfecto! Tu dinero está protegido"\n📚✨ "La administración inteligente es clave del éxito"`, m, ctxOk)
}

handler.help = ['depositar']
handler.tags = ['economy']
handler.command = ['deposit', 'depositar', 'd', 'dep']
handler.group = true

export default handler
