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
        ? `💙 \`${name2}\` Asesinó virtualmente a \`${name || who}\` en el duelo del concierto ⚔️` 
        : `💙 \`${name2}\` desapareció dramáticamente en el mundo virtual 💫`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/jrnH6CdNne0AAAPo/2s.mp4'
        let pp2 = 'https://media.tenor.com/NbBCakbfZnkAAAPo/die-kill.mp4'
        let pp3 = 'https://media.tenor.com/SIrXZQWK9WAAAAPo/me-friends.mp4'
        let pp4 = 'https://media.tenor.com/Ay1Nm0X2VP8AAAPo/falling-from-window-anime-death.mp4'
        let pp5 = 'https://media.tenor.com/rblZGXCYSmAAAAPo/akame.mp4'
        let pp6 = 'https://media.tenor.com/dtXcyLvxLLkAAAPo/akame.mp4'
        let pp7 = 'https://media.tenor.com/WakyzIJP0t0AAAPo/angels-of-death-anime-boy-bandage.mp4'
        let pp8 = 'https://media.tenor.com/wa_191SsAEwAAAPo/nana-anime.mp4'
        
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['kill']
handler.tags = ['anime']
handler.command = ['kill', 'matar', 'muere']
handler.group = true

export default handler
