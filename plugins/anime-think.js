import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `💙 \`${name2}\` está pensando en \`${name || who}\` en el concierto virtual 🤔` 
        : `💙 \`${name2}\` está reflexionando en el mundo virtual de Miku 🤔`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/keB3oG-he3AAAAPo/square-witch.mp4'
        let pp2 = 'https://media.tenor.com/IwyNIipPItQAAAPo/anime-naruto.mp4'
        let pp3 = 'https://media.tenor.com/gGO8Cx57zDYAAAPo/maomao-apothecary-diaries.mp4'
        let pp4 = 'https://media.tenor.com/SG0YhQcldrkAAAPo/zero-two-thinking.mp4'
        let pp5 = 'https://media.tenor.com/xrBy6-7YlWYAAAPo/tanjiro-wince.mp4'
        let pp6 = 'https://media.tenor.com/oi0BQ472-WIAAAPo/lu-guang-link-click.mp4'
        let pp7 = 'https://media.tenor.com/5q0lv--uUKUAAAPo/girls%27-last-tour-shoujo-shuumatsu-ryokou.mp4'
        let pp8 = 'https://media.tenor.com/Lsp3v_lraUsAAAPo/lu-guang-link-click.mp4'
        
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['think']
handler.tags = ['anime']
handler.command = ['think', 'pensar']
handler.group = true

export default handler

