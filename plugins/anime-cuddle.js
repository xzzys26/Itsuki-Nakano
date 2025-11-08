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
        ? `\`${name2}\` se acurrucó con \`${name || who}\` en el mundo virtual ꒰ঌ(˶ˆᗜˆ˵)໒꒱ 💙` 
        : `\`${name2}\` se acurrucó en el concierto virtual ꒰ঌ(˶ˆᗜˆ˵)໒꒱ 🎵`
    
    if (m.isGroup) {
        let pp = 'https://litter.catbox.moe/jx3xsy80i896uw45.mp4'
        let pp2 = 'https://litter.catbox.moe/v17caz2o6oh1ggw5.mp4'
        let pp3 = 'https://litter.catbox.moe/lcqkay06t7vfi07r.mp4'
        let pp4 = 'https://litter.catbox.moe/g1mge2ayw8hbqba2.mp4'
        let pp5 = 'https://litter.catbox.moe/ezhhdikt23ydv2ca.mp4'
        let pp6 = 'https://litter.catbox.moe/2dczzku8ur4hwv28.mp4'
        let pp7 = 'https://litter.catbox.moe/5b4yen0c9h2mf7lw.mp4'
        let pp8 = 'https://litter.catbox.moe/xt0x0ed3kk9bl8y1.mp4'

        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['cuddle']
handler.tags = ['anime']
handler.command = ['cuddle', 'acurrucarse', 'acurrucarseconmigo']
handler.group = true

export default handler

