/* 
🎤💙 Codígo creado por Brauliovh3
https://github.com/Brauliovh3/HATSUNE-MIKU.git 
*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `\`${name2}\` Embarazo a \`${name || who}\` ` 
        : `\`${name2}\` *se embarazó a sí mismo >.<*`
    
    if (m.isGroup) {
        let pp = './src/embarazar.mp4'
        
       
        
        const videos = [pp]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['coffee']
handler.tags = ['anime']
handler.command = ['preg', 'preñar', 'embarazar', 'ireporpan']
handler.group = true

export default handler

