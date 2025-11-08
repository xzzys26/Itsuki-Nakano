import fetch from "node-fetch"

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply(`🌟 Ingresa un link de YouTube\n\n📌 Ejemplo: .ytmp3 https://youtu.be/xxxxx`)

  const urlVideo = args[0].trim()

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    let res, fromBackup = false

    try {
      res = await fetch(`https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${encodeURIComponent(urlVideo)}`)
      if (!res.ok) throw new Error("Error en API principal")
      console.log("» Usando API principal (Zenkey)")
    } catch {
      console.warn("» Error con API principal, intentando respaldo...")
      res = await fetch(`https://apiadonix.kozow.com/download/ytmp3?apikey=${global.apikey}&url=${encodeURIComponent(urlVideo)}`)
      if (!res.ok) throw new Error("Error en API de respaldo")
      console.log("» Usando API de respaldo (Adonix)")
      fromBackup = true
    }

    const data = await res.json()
    console.log("📦 Respuesta completa del API:", JSON.stringify(data, null, 2))

    const downloadUrl = fromBackup
      ? data.url
      : (
        data.result?.download_url ??
        data.download_url ??
        data.url ??
        data.result?.url ??
        data.result?.link ??
        data.result?.audio ??
        null
      )

    if (!downloadUrl) return m.reply("❌ No se pudo obtener el audio de la respuesta.")

    const fileResp = await fetch(downloadUrl)
    const buffer = Buffer.from(await fileResp.arrayBuffer())

    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: "audio/mpeg",
        fileName: `audio.mp3`
      },
      { quoted: m }
    )

  } catch (e) {
    console.error("❌ Error en ytmp3 handler:", e)
    m.reply("❌ Error al descargar el audio. Intenta con otro link.")
  }
}

handler.command = ['ytmp3']
handler.help = ["ytmp3 <link>"]
handler.tags = ["descargas"]

export default handler
