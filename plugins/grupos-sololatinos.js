let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin, isOwner }) => {
  let chat = global.db.data.chats[m.chat]
  
  if (command === 'onlylatinos') {
    if (!m.isGroup) return m.reply('Solo grupos')
    if (!isAdmin && !isOwner) return m.reply('Solo admins')
    if (!isBotAdmin) return m.reply('Bot debe ser admin')
    
    let action = args[0]?.toLowerCase()
    
    if (action === 'on') {
      chat.onlyLatinos = true
      m.reply('> *✅ OnlyLatinos ACTIVADO*')
    } else if (action === 'off') {
      chat.onlyLatinos = false  
      m.reply('> *❌ OnlyLatinos DESACTIVADO*')
    } else {
      let status = chat.onlyLatinos ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'
      m.reply(`OnlyLatinos: ${status}\n\nUsa: ${usedPrefix}onlylatinos on/off`)
    }
  }
}

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) {
  if (!m.isGroup) return 
  
  let chat = global.db.data.chats[m.chat]
  if (!chat.onlyLatinos) return
  
  if (isBotAdmin && !isAdmin && !isOwner) {
    let badPrefixes = ["212", "234", "92", "93", "967"]
    let userNum = m.sender.split('@')[0]
    
    for (let prefix of badPrefixes) {
      if (userNum.startsWith(prefix)) {
        try {
          await m.reply('> ‼️ *Solo latinos permitidos*')
          await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        } catch(e) {
          console.log(e)
        }
        return false
      }
    }
  }
}

handler.command = /^(onlylatinos)$/i
export default handler