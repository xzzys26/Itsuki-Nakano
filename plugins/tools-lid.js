let handler = async function (m, { conn, participants, groupMetadata }) {
    if (!m.isGroup) return m.reply('Este comando solo funciona en grupos.')

    const normalizeJid = jid => jid?.replace(/[^0-9]/g, '')
    const participantList = groupMetadata.participants || []
    
    let teks = `┌──『 *🎭 INFORMACIÓN* 』──\n`
    teks += `│\n`
    
    const result = participantList.map((participant, index) => {
        const userId = participant.id.split('@')[0]
        teks += `│ ⎔ *Usuario #${index + 1}*\n`
        teks += `│ ✧ ID: ${participant.id}\n`
        teks += `│ ✧ Tag: @${userId}\n`
        teks += `│ ✧ Rango: ${participant.admin ? '👑 Admin' : '👤 Miembro'}\n`
        teks += `│${index === participantList.length - 1 ? '' : '\n'}`
        
        return {
            lid: participant.id,
            admin: participant.admin ? `@${userId}` : `@${userId}`
        }
    })

    teks += `│\n`
    teks += `└──『 *Total: ${participantList.length} usuarios* 』──`

    await conn.sendMessage(m.chat, { 
        text: teks, 
        mentions: participantList.map(p => p.id)
    })
}

handler.help = ['lid']
handler.tags = ['group']
handler.command = /^(lid)$/i
handler.group = true
handler.owner = true

export default handler
