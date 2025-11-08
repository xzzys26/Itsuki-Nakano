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
        ? `💙 \`${name2}\` le dio un abrazo virtual lleno de amor a \`${name || who}\` como en el mundo de Miku 🤗` 
        : `💙 \`${name2}\` se abrazó a sí mismo/a con cariño virtual 🤗`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/20DCjTUJnsMAAAPo/hugging-each-other-david-martinez.mp4'
        let pp2 = 'https://media.tenor.com/c6BBsLFmn7AAAAPo/chuunibyou-hug.mp4'
        let pp3 = 'https://media.tenor.com/UWdOymsSvFkAAAPo/bna-hug-bna.mp4'
        let pp4 = 'https://media.tenor.com/x7El3HRvEHEAAAPo/kon-hug.mp4'
        let pp5 = 'https://media.tenor.com/gqC-f_diA9EAAAPo/jujutsu-kaisen-hug.mp4'
        let pp6 = 'https://media.tenor.com/I6YEqtV4gv8AAAPo/anime-hug-hug.mp4'
        let pp7 = 'https://media.tenor.com/8o4fWGwBY1EAAAPo/aharensan-aharen.mp4'
        let pp8 = 'https://media.tenor.com/ifQBuYGBX1AAAAPo/levi-love.mp4'
        
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['hug']
handler.tags = ['anime']
handler.command = ['hug', 'abrazar','abrazos','abrazo','apapachar','apapacho','cariño','cariñoso','afecto','afectuoso','consuelo','consolar','reconfortar','mimar','mimos']
handler.group = true

export default handler


