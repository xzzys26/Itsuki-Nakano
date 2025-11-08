import fetch from "node-fetch"
import yts from "yt-search"
import crypto from "crypto"
import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://files.catbox.moe/zh5z6m.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Acción', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}

  try {
    if (!text?.trim())
      return conn.reply(m.chat, `> ‼️ 𝙋𝙤𝙧 𝙛𝙖𝙫𝙤𝙧 𝙞𝙣𝙜𝙧𝙚𝙨𝙖 𝙚𝙡 𝙣𝙤𝙢𝙗𝙧𝙚 𝙤 𝙚𝙣𝙡𝙖𝙘𝙚 𝙙𝙚𝙡 𝙫𝙞𝙙𝙚𝙤 𝙦𝙪𝙚 𝙙𝙚𝙨𝙚𝙖𝙨 𝙗𝙪𝙨𝙘𝙖𝙧.`, m, ctxWarn)

    await m.react('📥')

    const videoMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|v\/)?([a-zA-Z0-9_-]{11})/)
    const query = videoMatch ? `https://youtu.be/${videoMatch[1]}` : text

    const search = await yts(query)
    const result = videoMatch
      ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]
      : search.all[0]

    if (!result) throw '> ⚠️ 𝙉𝙤 𝙨𝙚 𝙚𝙣𝙘𝙤𝙣𝙩𝙧𝙖𝙧𝙤𝙣 𝙧𝙚𝙨𝙪𝙡𝙩𝙖𝙙𝙤𝙨 𝙥𝙖𝙧𝙖 𝙩𝙪 𝙗𝙪́𝙨𝙦𝙪𝙚𝙙𝙖.'

    const { title, thumbnail, timestamp, views, ago, url, author, seconds } = result
    if (seconds > 60000) throw '> 🚫 𝙀𝙡 𝙫𝙞𝙙𝙚𝙤 𝙨𝙪𝙥𝙚𝙧𝙖 𝙚𝙡 𝙡𝙞́𝙢𝙞𝙩𝙚 𝙙𝙚 𝙙𝙪𝙧𝙖𝙘𝙞𝙤́𝙣 (10 𝙢𝙞𝙣𝙪𝙩𝙤𝙨).'

    // ✅ CORREGIDO: Verificar si author existe antes de acceder a author.name
    const channelName = author?.name || '𝘾𝙖𝙣𝙖𝙡 𝘿𝙚𝙨𝙘𝙤𝙣𝙤𝙘𝙞𝙙𝙤'
    const vistas = formatViews(views)
    const info = `
> 🌸 𝙔𝙊𝙐𝙏𝙐𝘽𝙀 𝙋𝙇𝘼𝙔 𝙈𝙐𝙎𝙄𝘾 ✨️

> 🏷 𝙏𝙞́𝙩𝙪𝙡𝙤: ${title}
> 📺 𝘾𝙖𝙣𝙖𝙡: ${channelName}
> 👀 𝙑𝙞𝙨𝙩𝙖𝙨: ${vistas}
> ⏳️ 𝘿𝙪𝙧𝙖𝙘𝙞𝙤́𝙣: ${timestamp}
> 📆 𝙋𝙪𝙗𝙡𝙞𝙘𝙖𝙙𝙤: ${ago}
> 🖇 𝙀𝙣𝙡𝙖𝙘𝙚: ${url}`

    const thumb = (await conn.getFile(thumbnail)).data
    await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m, ...ctxOk })

    if (['play3', 'mp3'].includes(command)) {
      await m.react('🎶')

      const audio = await savetube.download(url, "audio")
      if (!audio?.status) throw `> ❌ 𝙀𝙧𝙧𝙤𝙧 𝙖𝙡 𝙤𝙗𝙩𝙚𝙣𝙚𝙧 𝙚𝙡 𝙖𝙪𝙙𝙞𝙤: ${audio.error}`

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audio.result.download },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        },
        { quoted: m, ...ctxOk }
      )

      await m.react('✅')
    }

    else if (['play4', 'mp4'].includes(command)) {
      await m.react('🎥')
      const video = await getVid(url)
      if (!video?.url) throw '> ⚠️ 𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙤𝙗𝙩𝙚𝙣𝙚𝙧 𝙚𝙡 𝙫𝙞𝙙𝙚𝙤.'

      await conn.sendMessage(
        m.chat,
        {
          video: { url: video.url },
          fileName: `${title}.mp4`,
          mimetype: 'video/mp4',
          caption: `> *🎀${title}*`
        },
        { quoted: m, ...ctxOk }
      )
      await m.react('✅')
    }

  } catch (e) {
    await m.react('❌')
    console.error('❌ Error en descarga YouTube:', e)
    return conn.reply(
      m.chat,
      typeof e === 'string'
        ? e
        : '> ⚠️ 𝙊𝙘𝙪𝙧𝙧𝙞𝙤́ 𝙪𝙣 𝙚𝙧𝙧𝙤𝙧 𝙞𝙣𝙚𝙨𝙥𝙚𝙧𝙖𝙙𝙤.\n> ‼️ 𝙐𝙨𝙖 ' + usedPrefix + '𝙧𝙚𝙥𝙤𝙧𝙩 𝙥𝙖𝙧𝙖 𝙞𝙣𝙛𝙤𝙧𝙢𝙖𝙧𝙡𝙤.\n\n ' + (e.message || 'Error desconocido'),
      m,
      ctxErr
    )
  }
}

handler.command = handler.help = ['play3', 'play4']
handler.tags = ['downloader']
handler.group = true

export default handler

async function getVid(url) {
  const apis = [
    {
      api: 'Yupra',
      endpoint: `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`,
      extractor: res => res?.result?.formats?.[0]?.url
    }
  ]
  return await fetchFromApis(apis)
}

async function fetchFromApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
      clearTimeout(timeout)
      const link = extractor(res)
      if (link) return { url: link, api }
    } catch (err) {
      console.log(`❌ 𝙀𝙧𝙧𝙤𝙧 𝙚𝙣 𝘼𝙋𝙄 ${api}:`, err.message)
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return null
}

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    info: "/v2/info",
    download: "/download",
    cdn: "/random-cdn"
  },
  headers: {
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://yt.savetube.me",
    referer: "https://yt.savetube.me/",
    "user-agent": "Postify/1.0.0"
  },
  crypto: {
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g)
      return Buffer.from(matches.join(""), "hex")
    },
    decrypt: async (enc) => {
      const secretKey = "C5D58EF67A7584E4A29F6C35BBC4EB12"
      const data = Buffer.from(enc, "base64")
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = savetube.crypto.hexToBuffer(secretKey)
      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv)
      let decrypted = decipher.update(content)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      return JSON.parse(decrypted.toString())
    },
  },
  youtube: (url) => {
    const patterns = [
      /youtube.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtu.be\/([a-zA-Z0-9_-]{11})/
    ]
    for (let pattern of patterns) {
      if (pattern.test(url)) return url.match(pattern)[1]
    }
    return null
  },
  request: async (endpoint, data = {}, method = "post") => {
    try {
      const { data: response } = await axios({
        method,
        url: `${endpoint.startsWith("http") ? "" : savetube.api.base}${endpoint}`,
        data: method === "post" ? data : undefined,
        params: method === "get" ? data : undefined,
        headers: savetube.headers
      })
      return { status: true, code: 200, data: response }
    } catch (error) {
      return { status: false, code: error.response?.status || 500, error: error.message }
    }
  },
  getCDN: async () => {
    const response = await savetube.request(savetube.api.cdn, {}, "get")
    if (!response.status) return response
    return { status: true, code: 200, data: response.data.cdn }
  },
  download: async (link, type = "audio") => {
    const id = savetube.youtube(link)
    if (!id) return { status: false, code: 400, error: "𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙤𝙗𝙩𝙚𝙣𝙚𝙧 𝙄𝘿 𝙙𝙚𝙡 𝙫𝙞𝙙𝙚𝙤" }
    try {
      const cdnx = await savetube.getCDN()
      if (!cdnx.status) return cdnx
      const cdn = cdnx.data
      const videoInfo = await savetube.request(
        `https://${cdn}${savetube.api.info}`,
        { url: `https://www.youtube.com/watch?v=${id}` }
      )
      if (!videoInfo.status) return videoInfo
      const decrypted = await savetube.crypto.decrypt(videoInfo.data.data)
      const downloadData = await savetube.request(
        `https://${cdn}${savetube.api.download}`,
        {
          id,
          downloadType: "audio",
          quality: "mp3",
          key: decrypted.key
        }
      )
      if (!downloadData.data.data?.downloadUrl)
        return { status: false, code: 500, error: "𝙉𝙤 𝙨𝙚 𝙥𝙪𝙙𝙤 𝙤𝙗𝙩𝙚𝙣𝙚𝙧 𝙡𝙞𝙣𝙠 𝙙𝙚 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖" }

      return {
        status: true,
        result: {
          download: downloadData.data.data.downloadUrl,
          title: decrypted.title || "𝘿𝙚𝙨𝙘𝙤𝙣𝙤𝙘𝙞𝙙𝙤"
        }
      }
    } catch (error) {
      return { status: false, code: 500, error: error.message }
    }
  }
}

function formatViews(views) {
  if (views === undefined) return "𝙉𝙤 𝙙𝙞𝙨𝙥𝙤𝙣𝙞𝙗𝙡𝙚"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}𝘽 (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}𝙈 (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}𝙠 (${views.toLocaleString()})`
  return views.toString()
}