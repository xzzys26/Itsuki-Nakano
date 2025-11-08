import axios from 'axios'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import fluent_ffmpeg from 'fluent-ffmpeg'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'

const tmp = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
    const img = new webp.Image()
    const stickerPackId = crypto.randomBytes(32).toString('hex')
    const json = {
        'sticker-pack-id': stickerPackId,
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': categories,
        ...extra
    }
    const exifAttr = Buffer.from([
        0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
        0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
        0x00,0x00,0x16,0x00,0x00,0x00
    ])
    const jsonBuffer = Buffer.from(JSON.stringify(json),'utf8')
    const exif = Buffer.concat([exifAttr, jsonBuffer])
    exif.writeUIntLE(jsonBuffer.length,14,4)
    await img.load(webpSticker)
    img.exif = exif
    return await img.save(null)
}

async function gifToWebpSticker(gifBuffer, packname, author) {
    const type = await fileTypeFromBuffer(gifBuffer) || { mime: 'application/octet-stream', ext: 'bin' }
    if (type.ext === 'bin') throw new Error('Tipo de archivo inválido')

    const tmpFile = path.join(tmp, `${Date.now()}.${type.ext}`)
    const outFile = `${tmpFile}.webp`
    await fs.promises.writeFile(tmpFile, gifBuffer)

    await new Promise((resolve, reject) => {
        fluent_ffmpeg(tmpFile)
        .addOutputOptions([
            '-vcodec', 'libwebp',
            '-vf', "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
        ])
        .toFormat('webp')
        .save(outFile)
        .on('end', resolve)
        .on('error', reject)
    })

    const buffer = await fs.promises.readFile(outFile)
    fs.promises.unlink(tmpFile).catch(() => {})
    fs.promises.unlink(outFile).catch(() => {})

    return await addExif(buffer, packname, author)
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `✎ Usa: ${usedPrefix}${command} opción1 opción2 ...`, m)

    const opciones = text.split(' ').filter(Boolean)
    if (opciones.length < 2) return conn.reply(m.chat, '❌ Debes enviar al menos 2 opciones', m)

    await m.react('🕒')

    try {
        const res = await axios.get('https://mayapi.ooguy.com/roulette', {
            params: { options: JSON.stringify(opciones), apikey: 'nevi' },
            responseType: 'arraybuffer'
        })

        const data = JSON.parse(Buffer.from(res.data).toString() || '{}')
        if (!data.status || !data.url) return conn.reply(m.chat, '❌ Error al generar la ruleta', m)

        const gifRes = await axios.get(data.url, { responseType: 'arraybuffer' })
        const packname = '✦ Ruleta ✦'
        const author = 'powered by Leo Xzsy'
        const stickerBuffer = await gifToWebpSticker(Buffer.from(gifRes.data), packname, author)

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })

        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('❌')
        conn.reply(m.chat, '❌ Ocurrió un error al girar la ruleta', m)
    }
}

handler.help = ['ruleta']
handler.tags = ['game']
handler.command = ['ruleta']

export default handler
