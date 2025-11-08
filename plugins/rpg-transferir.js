async function handler(m, { conn, args, usedPrefix, command }) {
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Transferencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  
  const currency = global.currency || 'Yenes'

  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return conn.reply(m.chat, `🍙📚 *ITSUKI - Sistema de Economía*\n\n❌ Los comandos de economía están desactivados en este grupo\n\n*Administrador*, activa la economía con:\n${usedPrefix}economy on\n\n📖 "No puedo procesar transferencias si la economía está desactivada..."`, m, ctxErr)
  }

  let mentionedJid = await m.mentionedJid
  const who = m.quoted ? await m.quoted.sender : (mentionedJid && mentionedJid[0]) || (args[1] ? (args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '')

  if (!args[0]) {
    return conn.reply(m.chat, `🍙💸 *ITSUKI - Transferencia Bancaria*\n\n❌ Debes especificar la cantidad y el destinatario\n\n📝 *Uso correcto:*\n${usedPrefix}${command} <cantidad> @usuario\n\n💡 *Ejemplo:*\n${usedPrefix}${command} 5000 @usuario\n\n📚 "Especifica cuánto deseas transferir y a quién..."`, m, ctxWarn)
  }

  if (!isNumber(args[0]) && args[0].startsWith('@')) {
    return conn.reply(m.chat, `🍙⚠️ *ITSUKI - Orden Incorrecto*\n\n❌ Primero indica la cantidad, luego la persona\n\n📝 *Formato correcto:*\n${usedPrefix}${command} <cantidad> @usuario\n\n💡 *Ejemplo:*\n${usedPrefix}${command} 1000 @usuario\n\n📚 "El orden correcto es: cantidad primero, destinatario después"`, m, ctxWarn)
  }

  if (!who) {
    return conn.reply(m.chat, `🍙❌ *ITSUKI - Destinatario Faltante*\n\n⚠️ Debes mencionar a quién le transferirás ${currency}\n\n📝 *Formas de mencionar:*\n• Responder a su mensaje\n• Mencionar con @usuario\n• Usar su número\n\n📚 "Necesito saber a quién enviar el dinero..."`, m, ctxErr)
  }

  if (!(who in global.db.data.users)) {
    return conn.reply(m.chat, `🍙❌ *ITSUKI - Usuario No Registrado*\n\n⚠️ Este usuario no está en mi base de datos\n\n📚 "El destinatario debe haber usado el bot al menos una vez..."`, m, ctxErr)
  }

  if (who === m.sender) {
    return conn.reply(m.chat, `🍙😅 *ITSUKI - Transferencia Inválida*\n\n❌ No puedes transferirte dinero a ti mismo\n\n📚 "Eso no tiene sentido... ¡ya es tu dinero!"`, m, ctxWarn)
  }

  let user = global.db.data.users[m.sender]
  let recipient = global.db.data.users[who]
  let count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(10, (isNumber(args[0]) ? parseInt(args[0]) : 10)))

  if (typeof user.bank !== 'number') user.bank = 0

  if (user.bank < count) {
    return conn.reply(m.chat, `🍙💸 *ITSUKI - Fondos Insuficientes*\n\n❌ No tienes suficiente dinero en el banco\n\n💰 *Datos:*\n🏦 Dinero en banco: ¥${user.bank.toLocaleString()} ${currency}\n💸 Intentaste transferir: ¥${count.toLocaleString()} ${currency}\n❌ Faltante: ¥${(count - user.bank).toLocaleString()} ${currency}\n\n📚 "Solo puedes transferir el dinero que tienes en el banco..."\n\n💡 Usa: *${usedPrefix}deposit* para depositar más dinero`, m, ctxWarn)
  }

  if (count < 10) {
    return conn.reply(m.chat, `🍙⚠️ *ITSUKI - Monto Mínimo*\n\n❌ La cantidad mínima a transferir es ¥10 ${currency}\n\n📚 "Las transferencias muy pequeñas no son procesadas..."`, m, ctxWarn)
  }

  // Realizar la transferencia
  user.bank -= count
  if (typeof recipient.bank !== 'number') recipient.bank = 0
  recipient.bank += count

  if (isNaN(user.bank)) user.bank = 0

  let name = await (async () => global.db.data.users[who].name || (async () => { 
    try { 
      const n = await conn.getName(who); 
      return typeof n === 'string' && n.trim() ? n : who.split('@')[0] 
    } catch { 
      return who.split('@')[0] 
    } 
  })())()

  const senderName = await conn.getName(m.sender) || m.sender.split('@')[0]

  // Mensaje de confirmación al remitente
  await conn.reply(m.chat, 
    `🍙💰 *ITSUKI - Transferencia Exitosa* 📚✨\n\n` +
    `✅ Transferencia completada correctamente\n\n` +
    `📊 *Detalles de la transacción:*\n` +
    `👤 De: ${senderName}\n` +
    `👤 Para: ${name}\n` +
    `💵 Monto: ¥${count.toLocaleString()} ${currency}\n\n` +
    `💰 *Tu nuevo balance:*\n` +
    `🏦 Banco: ¥${user.bank.toLocaleString()} ${currency}\n\n` +
    `📚 "Transferencia procesada con éxito"\n` +
    `🍱✨ "¡Gracias por usar el sistema bancario de Itsuki!"`, 
    m, 
    { ...ctxOk, mentions: [who] }
  )

  // Notificar al destinatario
  await conn.sendMessage(who, {
    text: `🍙💰 *ITSUKI - Dinero Recibido* 📚✨\n\n` +
          `🎉 ¡Has recibido una transferencia!\n\n` +
          `📊 *Detalles:*\n` +
          `👤 De: ${senderName}\n` +
          `💵 Monto recibido: ¥${count.toLocaleString()} ${currency}\n` +
          `🏦 Nuevo balance: ¥${recipient.bank.toLocaleString()} ${currency}\n\n` +
          `📚 "¡Alguien te ha enviado dinero!"\n` +
          `🍱✨ "El dinero ya está disponible en tu banco"`,
    contextInfo: ctxOk.contextInfo
  })
}

handler.help = ['pay']
handler.tags = ['economy']
handler.command = ['pay', 'coinsgive', 'givecoins', 'transferir']
handler.group = true

export default handler

function isNumber(x) {
  return !isNaN(x)
}