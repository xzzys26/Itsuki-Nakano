/* 
🎤💙 Codígo creado por Brauliovh3
✧ https://github.com/Brauliovh3/HATSUNE-MIKU.git 
*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `\`${name2}\` está mareado con \`${name || who}\` en el concierto virtual (⸝⸝๑﹏๑⸝⸝) 🎤💙` 
        : `\`${name2}\` está mareado en el mundo virtual (⸝⸝๑﹏๑⸝⸝) ✨🎵`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/MAGJ3RtxAKgAAAPo/anime-aqua.mp4'
        let pp2 = 'https://media.tenor.com/Fklz9LmOsngAAAPo/anime-meme.mp4'
        let pp3 = 'https://media.tenor.com/KE5uPjc53AIAAAPo/death-note-drunk-misa.mp4'
        let pp4 = 'https://media.tenor.com/NY8FLOoS4MwAAAPo/drink-anime-drink.mp4'
        let pp5 = 'https://media.tenor.com/XrrDSU3E4loAAAPo/rock-lee-kimimaro.mp4'
        let pp6 = 'https://media.tenor.com/bjzCtxqxpWcAAAPo/yor-forger-spy-x-family.mp4'
        let pp7 = 'https://media.tenor.com/ReniyI64SfoAAAPo/anime-adam-apple.mp4'
        let pp8 = 'https://media.tenor.com/RBh2Mruffi4AAAPo/dizzy-fubuki.mp4'
       
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['drunk']
handler.tags = ['anime']
handler.command = ['drunk', 'borracho', 'mareado', 'dizzy','tomar','beber']
handler.group = true

export default handler
