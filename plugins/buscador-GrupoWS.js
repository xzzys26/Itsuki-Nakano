import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `🦋 Escribe el nombre del grupo a buscar.\nEj: *${usedPrefix + command} freefire*`, m)
    await m.react('🕒') 

    try {
        const res = await fetch(`https://apiadonix.kozow.com/search/wpgroups?apikey=Adofreekey&q=${encodeURIComponent(text)}`)
        const json = await res.json()
        
        if (!json.status || !json.data || json.data.length === 0) {
            return conn.reply(m.chat, `No encontré grupos con: *${text}*`, m)
        }

        
        let message = `❤️ *Resultados de grupos para:* *${text}*\n\n`
        json.data.slice(0, 10).forEach((g, i) => {
            message += `「🌻」 Busca *<${g.name}>*\n`
            message += `> 🐝 Link » ${g.link}\n\n`
        })

        conn.sendMessage(m.chat, { text: message }, { quoted: m })
        
    } catch (e) {
        console.error(e)
        conn.reply(m.chat, '> Ocurrió un error buscando los grupos', m)
    }
}

handler.command = ['wpgroups']
handler.tags = ['buscador']
handler.help = ['wpgroups']
export default handler
