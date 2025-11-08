/* 
🎤💙 Código creado por Brauliovh3 
https://github.com/Brauliovh3/HATSUNE-MIKU.git 
💙 Hatsune Miku Bot - Virtual Concert Experience 🎵✨
*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `💙 \`${name2}\` le hizo una cara traviesa a \`${name || who}\` en el concierto virtual 😜` 
        : `💙 \`${name2}\` está siendo travies@ en el mundo virtual de Miku 😜`
    
    if (m.isGroup) {
        let pp = 'https://files.catbox.moe/lw9vib.mp4'
        let pp2 = 'https://files.catbox.moe/fkpixw.mp4'
        let pp3 = 'https://files.catbox.moe/20fwhs.mp4'
        let pp4 = 'https://files.catbox.moe/47l2en.mp4'
        let pp5 = 'https://files.catbox.moe/72c73l.mp4'
        let pp6 = 'https://files.catbox.moe/gjmek1.mp4'
        let pp7 = 'https://files.catbox.moe/3wozf1.mp4'
        let pp8 = 'https://files.catbox.moe/zze793.mp4'
        
    
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['bleh']
handler.tags = ['anime']
handler.command = ['bleh', 'lengua', 'hacercara', 'carita', 'carcajada']
handler.group = true

export default handler

