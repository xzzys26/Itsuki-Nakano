import fetch from 'node-fetch'

/**

🎀 CREADO POR: LeoXzzsy
🌸 ADAPTADO PARA: Itsuki-Nakano IA
📚 VERSIÓN: 3.4.0 Beta
🏷️ SISTEMA DE DESCARGAS APK PREMIUM
*/

let handler = async (m, { conn, usedPrefix, command, args }) => {
const ctxErr = (global.rcanalx || {})
const ctxWarn = (global.rcanalw || {})
const ctxOk = (global.rcanalr || {})

// Verificar si el usuario es premium
let user = global.db.data.users[m.sender];
if (!user.premium || user.premiumTime < Date.now()) {
return conn.reply(m.chat,
`╭━━━〔 🎀 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 🎀 〕━━━⬣
│ ❌ *Comando Exclusivo Premium*
│ 
│ 💎 Descargas de APK
│ solo para miembros premium
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌟 *Obtén tu membresía:*
│ ${usedPrefix}premium dia
│ ${usedPrefix}premium semana  
│ ${usedPrefix}premium mes

🌸 *¡Únete al club exclusivo de Itsuki!* (◕‿◕✿)`, 
m, ctxErr);
}

try {
if (!args[0]) {
return conn.reply(m.chat,
`╭━━━〔 🎀 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐃𝐎𝐑 𝐀𝐏𝐊 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🎀 〕━━━⬣
│ 📌 *Uso correcto:*
│ ${usedPrefix + command} <nombre_de_la_app>
│ 
│ 🎯 *Ejemplos populares:*
│ ${usedPrefix + command} whatsapp
│ ${usedPrefix + command} tiktok
│ ${usedPrefix + command} facebook
│ ${usedPrefix + command} instagram
│ ${usedPrefix + command} spotify
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki descargará la aplicación para ti...* (◕‿◕✿)`,
m, ctxWarn)
}

const appName = args.join(' ').toLowerCase()    

// Mensaje de búsqueda - NO se borra    
await conn.reply(m.chat,    
`╭━━━〔 🎀 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 𝐀𝐏𝐏 🎀 〕━━━⬣
│ 🔍 *Buscando aplicación premium...*
│ 
│ 📱 *Nombre:* ${appName}
│ ⚡ *Estado:* Consultando repositorios
│ 💎 *Tipo:* Descarga Premium
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki está trabajando en ello...* 📱`,    
m, ctxWarn    
)    

// ✅ API CORREGIDA
const apiUrl = `https://mayapi.ooguy.com/apk?query=${encodeURIComponent(appName)}&apikey=may-f53d1d49`    
const response = await fetch(apiUrl, {    
timeout: 30000    
})    

if (!response.ok) {    
throw new Error(`Error en la API: ${response.status}`)    
}    

const data = await response.json()    
console.log('📦 Respuesta de API APK:', data)    

if (!data.status || !data.result) {    
throw new Error('No se encontró la aplicación solicitada')    
}    

const appData = data.result    
const downloadUrl = appData.url    
const appTitle = appData.title || appName    
const appVersion = 'Última versión'    
const appSize = 'Tamaño no especificado'    
const appDeveloper = 'Desarrollador no especificado'    

if (!downloadUrl) {    
throw new Error('No se encontró enlace de descarga')    
}    

// Mensaje de aplicación encontrada - NO se borra    
await conn.reply(m.chat,    
`╭━━━〔 🎀 𝐀𝐏𝐏 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀 🎀 〕━━━⬣
│ ✅ *¡Aplicación encontrada!*
│ 
│ 📱 *Nombre:* ${appTitle}
│ 🔄 *Versión:* ${appVersion}
│ 💾 *Tamaño:* ${appSize}
│ 👨‍💻 *Desarrollador:* ${appDeveloper}
│ 💎 *Estado:* Preparando descarga
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki está preparando tu APK...* ⬇️`,    
m, ctxOk    
)    

// Enviar el archivo APK    
await conn.sendMessage(m.chat, {    
document: { url: downloadUrl },    
mimetype: 'application/vnd.android.package-archive',    
fileName: `${appTitle.replace(/\s+/g, '_')}_v${appVersion}.apk`,    
caption: 
`╭━━━〔 🎀 𝐀𝐏𝐊 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐃𝐎 🎀 〕━━━⬣
│ ✅ *¡Descarga completada!*
│ 
│ 📱 *Aplicación:* ${appTitle}
│ ⭐ *Versión:* ${appVersion}
│ 💾 *Tamaño:* ${appSize}
│ 👨‍💻 *Desarrollador:* ${appDeveloper}
│ 💎 *Tipo:* Descarga Premium
╰━━━━━━━━━━━━━━━━━━━━━━⬣

⚠️ *Instala bajo tu propia responsabilidad*
🌸 *¡Disfruta tu aplicación premium!* (◕‿◕✿)
🎀 *Beneficio exclusivo para miembros premium* 💫`    
}, { quoted: m })    

await m.react('✅')

} catch (error) {
console.error('❌ Error en descarga APK:', error)

await conn.reply(m.chat,    
`╭━━━〔 🎀 𝐄𝐑𝐑𝐎𝐑 𝐃𝐄 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀 🎀 〕━━━⬣
│ ❌ *Error en la descarga*
│ 
│ 📝 *Detalles:* ${error.message}
│ 
│ 🔍 *Posibles causas:*
│ • Nombre de aplicación incorrecto
│ • Aplicación no disponible
│ • Error del servidor
│ • Intenta con otro nombre
╰━━━━━━━━━━━━━━━━━━━━━━⬣

🌸 *Itsuki lo intentará de nuevo...* (´；ω；\`)
🎀 *Por favor, intenta con otro nombre*`,    
m, ctxErr    
)    

await m.react('❌')

}
}

handler.help = ['apk']
handler.tags = ['downloader']
handler.command = ['apk', 'apkdl', 'descargarapk']
handler.register = true

export default handler