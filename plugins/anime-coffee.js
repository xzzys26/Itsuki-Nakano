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
        ? `\`${name2}\` está tomando café con \`${name || who}\` en el café virtual (≧▽≦) ☕💙` 
        : `\`${name2}\` está tomando café en el mundo virtual ٩(●ᴗ●)۶ ☕✨`
    
    if (m.isGroup) {
        let pp = 'https://litter.catbox.moe/t5wv0phnxiaiq87x.mp4'
        let pp2 = 'https://litter.catbox.moe/ayfpmiayvqgme34c.mp4'
        let pp3 = 'https://litter.catbox.moe/651i6dtn5tzdcfda.mp4'
        let pp4 = 'https://litter.catbox.moe/gq1ctnrgi35wjcy6.mp4'
        let pp5 = 'https://litter.catbox.moe/f9bh227687z0uv9e.mp4'
        let pp6 = 'https://litter.catbox.moe/85c71f5grfpan1lp.mp4'
        let pp7 = 'https://litter.catbox.moe/2807oldlnacxgz3x.mp4'
        let pp8 = 'https://litter.catbox.moe/nqs0fnik16efqfac.mp4'
       
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['coffee']
handler.tags = ['anime']
handler.command = ['coffee', 'cafe', 'café', 'tomarcafe', 'tomarcafé']
handler.group = true

export default handler

