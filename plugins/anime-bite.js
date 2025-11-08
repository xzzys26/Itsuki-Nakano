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
        ? `💙 \`${name2}\` dio un mordisquito juguetón a \`${name || who}\` en el concierto virtual 😋` 
        : `💙 \`${name2}\` está siendo travieso/a en el mundo virtual 😋`
    
    if (m.isGroup) {
        let pp = 'https://files.catbox.moe/hzqf02.mp4'
        let pp2 = 'https://files.catbox.moe/f1my4q.mp4'
        let pp3 = 'https://files.catbox.moe/rjl6le.mp4'
        let pp4 = 'https://files.catbox.moe/bv8ive.mp4'
        let pp5 = 'https://files.catbox.moe/65nrq2.mp4'
        let pp6 = 'https://files.catbox.moe/n7gpxh.mp4'
        let pp7 = 'https://files.catbox.moe/jhtkbu.mp4'
        let pp8 = 'https://files.catbox.moe/9c7ejd.mp4'
        
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['bite']
handler.tags = ['anime']
handler.command = ['bite', 'morder', 'mordisco', 'mordida', 'picar']
handler.group = true

export default handler




