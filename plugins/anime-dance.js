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
        ? `💙 \`${name2}\` está bailando en el concierto virtual con \`${name || who}\` como Miku ` 
        : `💙 \`${name2}\` está bailando en el escenario virtual como Hatsune Miku `
    
    if (m.isGroup) {
        let pp = 'https://litter.catbox.moe/883kzka79wv1dtah.mp4'
        let pp2 = 'https://litter.catbox.moe/3uvca2ijyh0l0y6b.mp4'
        let pp3 = 'https://litter.catbox.moe/s8wt67cigp7hb440.mp4'
        let pp4 = 'https://litter.catbox.moe/72m7inirzcro7ttk.mp4'
        let pp5 = 'https://litter.catbox.moe/wqj08v2osvgjgqth.mp4'
        let pp6 = 'https://litter.catbox.moe/1yai4xl2orezw4au.mp4'
        let pp7 = 'https://litter.catbox.moe/d4dr37eqydlay2wl.mp4'
        let pp8 = 'https://litter.catbox.moe/oc3x4bb8dv4z8gqm.mp4'
        
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['dance']
handler.tags = ['anime']
handler.command = ['dance', 'bailar','dancing']
handler.group = true

export default handler

