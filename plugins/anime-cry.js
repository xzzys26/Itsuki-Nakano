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
        ? `💙 \`${name2}\` está derramando lágrimas por \`${name || who}\` en el concierto virtual 😢` 
        : `💙 \`${name2}\` está llorando en el mundo virtual de Miku 😢`
    
    if (m.isGroup) {
        let pp = 'https://litter.catbox.moe/n0ew3er2iays5uwn.mp4'
        let pp2 = 'https://litter.catbox.moe/8pk0ge34o47ilw6a.mp4'
        let pp3 = 'https://litter.catbox.moe/hnlvhfh64f4xpc2x.mp4'
        let pp4 = 'https://litter.catbox.moe/dmdp0rryr4gnht4r.mp4'
        let pp5 = 'https://litter.catbox.moe/51acng21azvakg4n.mp4'
        let pp6 = 'https://litter.catbox.moe/tmsxetb4ctrn6qpt.mp4'
        let pp7 = 'https://litter.catbox.moe/psinj6y62lj924bl.mp4'
        let pp8 = 'https://litter.catbox.moe/icuv01ingui6zlfo.mp4'
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['cry']
handler.tags = ['anime']
handler.command = ['cry', 'llorar', 'lagrimas']
handler.group = true

export default handler

