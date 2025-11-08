/* 
🎤💙 Código creado por Brauliovh3 
✧ https://github.com/Brauliovh3/HATSUNE-MIKU.git 
💙 Hatsune Miku Bot - Virtual Concert Experience 🎵✨
*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `😒 \`${name2}\` está mostrando su lado más molesto con \`${name || who}\` en el escenario virtual 😤` 
        : `💝 \`${name2}\` está expresando su sentimiento en el concierto virtual 😤`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/YPBIySGgoM0AAAPo/anime-rem.mp4'
        let pp2 = 'https://media.tenor.com/z2iFD-hLYnAAAAPo/anime-girl-anime.mp4'
        let pp3 = 'https://media.tenor.com/xMFhPvyO7m0AAAPo/smartphone-anime.mp4'
        let pp4 = 'https://media.tenor.com/X1Ux_VD2ME0AAAPo/tokyoghoul.mp4'
        let pp5 = 'https://media.tenor.com/cYRAeQqpaUMAAAPo/anime-angry-slow-loop.mp4'
        let pp6 = 'https://media.tenor.com/hkoyf1VeaZ4AAAPo/anime-angry.mp4'
        let pp7 = 'https://media.tenor.com/rzDkOlEDun0AAAPo/hayase-nagatoro-nagatoro-angry.mp4'
        let pp8 = 'https://media.tenor.com/Q_SHYUU4NccAAAPo/anime-evil.mp4'
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['angry']
handler.tags = ['anime']
handler.command = ['angry', 'enojado','molesto', 'enojada', 'molesta']
handler.group = true

export default handler





