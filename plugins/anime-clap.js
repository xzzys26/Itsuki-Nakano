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
        ? `💙 ${name2}\` está aplaudiendo por \`${name || who}\` en el concierto virtual 🎵` 
        : `💙 ${name2}\` está aplaudiendo en el escenario virtual (〃＞▿＜〃) 💙`
    
    if (m.isGroup) {
        let pp = 'https://files.catbox.moe/bvl4r9.mp4'
        let pp2 = 'https://files.catbox.moe/nba9tk.mp4'
        let pp3 = 'https://files.catbox.moe/uj4jb8.mp4'
        let pp4 = 'https://files.catbox.moe/jtza57.mp4'
        let pp5 = 'https://files.catbox.moe/o07ijf.mp4'
        let pp6 = 'https://files.catbox.moe/mmjkzk.mp4'
        let pp7 = 'https://files.catbox.moe/bpw86t.mp4'
        let pp8 = 'https://files.catbox.moe/wuhlln.mp4'
       
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['clap']
handler.tags = ['anime']
handler.command = ['clap', 'aplaudir', 'aplauso', 'aplausos', 'aplaudimiento']
handler.group = true

export default handler

