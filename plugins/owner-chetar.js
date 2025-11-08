// cheat-yenes.js - YENES INFINITOS (COMPATIBLE CON TU PERFIL)
let handler = async (m, { conn, usedPrefix, command, isOwner, args, sender }) => {
  const ctxErr = global.rcanalx || {}
  const ctxWarn = global.rcanalw || {}
  const ctxOk = global.rcanalr || {}
  
  // Inicializar sistema en la base de datos global (COMPATIBLE CON TU PERFIL)
  if (!global.db.data.users) global.db.data.users = {}
  
  // Función para obtener monedas (COMPATIBLE CON TU CÓDIGO DE PERFIL)
  const getMonedas = (userId) => {
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    return global.db.data.users[userId].coin || 
           global.db.data.users[userId].bank || 
           global.db.data.users[userId].yenes || 0
  }
  
  // Función para establecer monedas (COMPATIBLE CON TU CÓDIGO DE PERFIL)
  const setMonedas = (userId, amount) => {
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    // Establecer en TODOS los campos de monedas para compatibilidad
    global.db.data.users[userId].coin = amount
    global.db.data.users[userId].bank = amount
    global.db.data.users[userId].yenes = amount
    global.db.data.users[userId].money = amount
    global.db.data.users[userId].moneda = amount
    return amount
  }

  // Yenes infinitos para mí
  if (command === 'infinito') {
    setMonedas(sender, 999999999)
    return conn.reply(m.chat, 
      `🍙∞ *YENES INFINITOS ACTIVADOS* 💴✨\n\n` +
      `💰 *Monedas asignadas:* 999,999,999\n` +
      `👤 *Para:* ${m.name || 'Tú'}\n\n` +
      `💡 *Campos actualizados:*\n` +
      `• coin ✅\n• bank ✅\n• yenes ✅\n• money ✅\n• moneda ✅\n\n` +
      `🎯 Ahora usa ${usedPrefix}perfil para verificar`,
      m, ctxOk
    )
  }

  // Chetear a otros (solo owner)
  if (command === 'chetar' && isOwner) {
    let target = args[0]
    let amount = parseInt(args[1]) || 999999
    
    if (!target) {
      setMonedas(sender, amount)
      return conn.reply(m.chat, 
        `🍙💰 *AUTOCHEAT ACTIVADO* 💴\n\n` +
        `👤 *Para:* ${m.name || 'Tú'}\n` +
        `💰 *Monedas:* ${amount.toLocaleString()}\n\n` +
        `💡 Usa ${usedPrefix}perfil para verificar`,
        m, ctxOk
      )
    }

    if (target.startsWith('@')) {
      target = target.replace('@', '') + '@s.whatsapp.net'
    } else if (!target.includes('@')) {
      target = target + '@s.whatsapp.net'
    }

    setMonedas(target, amount)
    const targetName = await conn.getName(target).catch(() => 'Usuario')
    
    return conn.reply(m.chat, 
      `🍙⚡ *CHETEADO EXITOSO* 💴\n\n` +
      `👤 *Usuario:* ${targetName}\n` +
      `💰 *Monedas asignadas:* ${amount.toLocaleString()}\n\n` +
      `🎯 El usuario puede verlo con ${usedPrefix}perfil`,
      m, ctxOk
    )
  }

  // Ver monedas de cualquier usuario (solo owner)
  if (command === 'beryenes' && isOwner) {
    let target = args[0] || sender
    
    if (target.startsWith('@')) {
      target = target.replace('@', '') + '@s.whatsapp.net'
    } else if (!target.includes('@')) {
      target = target + '@s.whatsapp.net'
    }

    const monedas = getMonedas(target)
    const targetName = await conn.getName(target).catch(() => 'Usuario')
    const userData = global.db.data.users[target] || {}
    
    return conn.reply(m.chat, 
      `🍙🔍 *INFORMACIÓN DE MONEDAS* 💴\n\n` +
      `👤 *Usuario:* ${targetName}\n` +
      `📱 *ID:* ${target.split('@')[0]}\n` +
      `💰 *Monedas totales:* ${monedas.toLocaleString()}\n\n` +
      `📊 *Detalles:*\n` +
      `• coin: ${userData.coin || 0}\n` +
      `• bank: ${userData.bank || 0}\n` +
      `• yenes: ${userData.yenes || 0}\n` +
      `• money: ${userData.money || 0}\n` +
      `• moneda: ${userData.moneda || 0}`,
      m, ctxOk
    )
  }

  if ((command === 'chetar' || command === 'beryenes') && !isOwner) {
    return conn.reply(m.chat, 
      `🍙❌ *ACCESO DENEGADO* 🔒\n\n` +
      `⚠️ Solo LeoXzz puede usar este comando\n\n` +
      `💡 Usa ${usedPrefix}infinito para obtener monedas`,
      m, ctxErr
    )
  }
}

handler.command = ['infinito', 'chetar', 'beryenes']
handler.tags = ['yenes']
handler.help = ['infinito', 'chetar @usuario cantidad', 'beryenes @usuario']
handler.owner = true

export default handler