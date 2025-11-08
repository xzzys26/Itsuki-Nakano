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
        ? `\`${name2}\` se da una palmada en la cara por las travesuras de \`${name || who}\` en el concierto virtual (ভ_ ভ) ރ 🎤💙` 
        : `\`${name2}\` se da una palmada en la cara en el mundo virtual (ভ_ ভ) ރ 🎵`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/OZe16n5yEP4AAAPo/vnc-vanitas.mp4'
        let pp2 = 'https://media.tenor.com/miK-GklQp2MAAAPo/facepalm-anime.mp4'
        let pp3 = 'https://media.tenor.com/X3QRuo_MqTEAAAPo/shikamaru-anime.mp4'
        let pp4 = 'https://media.tenor.com/bqWIhrDQO4UAAAPo/genshin-impact-lumine.mp4'
        let pp5 = 'https://media.tenor.com/PI-erK3Ds_sAAAPo/huang-qinglong-facepalm.mp4'
        let pp6 = 'https://media.tenor.com/Ktim6-Sh99oAAAPo/mitsuha.mp4'
        let pp7 = 'https://media.tenor.com/_QiJbPdKqBYAAAPo/yoriko-kichijouji-yoriko.mp4'
        let pp8 = 'https://media.tenor.com/q2TMzGiYbA4AAAPo/bsd-bungo-stray-dogs.mp4'
  
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['facepalm']
handler.tags = ['anime']
handler.command = ['facepalm', 'palmada','decepcionar','frustrar','desilusionar','disgustar','defraudar','desengañar','desencantar','abatir']
handler.group = true

export default handler
