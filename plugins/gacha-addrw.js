import fetch from 'node-fetch'

const handler = async (m, { text, usedPrefix, command, conn }) => {
    const ctxErr = global.rcanalx || {}
    const ctxWarn = global.rcanalw || {}
    const ctxOk = global.rcanalr || {}

    const args = text.split(',').map(arg => arg.trim())

    if (args.length < 7) {
        return conn.reply(m.chat, 
            `🍙📚 *ITSUKI - Agregar Personaje* ✨\n\n` +
            `❌ Faltan datos del personaje\n\n` +
            `📝 *Formato correcto:*\n` +
            `${usedPrefix}${command} <Nombre>, <Género>, <Valor>, <Origen>, <Imagen 1>, <Imagen 2>, <Imagen 3>\n\n` +
            `💡 *Ejemplo:*\n` +
            `${usedPrefix}${command} Itsuki Nakano, Femenino, 100, Quintillizas, https://catbox.moe/xxx.jpg, https://catbox.moe/yyy.jpg, https://catbox.moe/zzz.jpg\n\n` +
            `⚠️ *Nota:* Los links deben ser de catbox.moe o qu.ax (permanente)\n\n` +
            `📖 "Completa todos los campos correctamente"`,
            m, ctxWarn
        )
    }

    const [name, gender, value, source, img1, img2, img3] = args

    if (!img1.startsWith('http') || !img2.startsWith('http') || !img3.startsWith('http')) {
        return conn.reply(m.chat, 
            `🍙❌ *ITSUKI - Enlaces Inválidos*\n\n` +
            `⚠️ Los enlaces de las imágenes no son válidos\n\n` +
            `📝 Deben empezar con http:// o https://\n\n` +
            `💡 Usa catbox.moe o qu.ax para subir imágenes\n\n` +
            `📚 "Verifica que los enlaces estén correctos"`,
            m, ctxErr
        )
    }

    const characterData = {
        id: Date.now().toString(),
        name,
        gender,
        value,
        source,
        img: [img1, img2, img3],
        vid: [],
        user: null,
        status: "Libre",
        votes: 0
    }

    // Cambia este número por el del staff
    const tagNumber = global.owner?.[0]?.[0] + '@s.whatsapp.net' || '573154062343@s.whatsapp.net'

    const jsonMessage = 
        `🍙📋 *ITSUKI - Nuevo Personaje Añadido* ✨\n\n` +
        `👤 *Solicitado por:* @${m.sender.split('@')[0]}\n\n` +
        `📄 *Datos del personaje:*\n\`\`\`${JSON.stringify(characterData, null, 2)}\`\`\`\n\n` +
        `📚 "Revisa la información para aprobación"`

    try {
        await conn.sendMessage(tagNumber, { 
            text: jsonMessage,
            mentions: [m.sender]
        })

        await conn.reply(m.chat, 
            `🍙✅ *ITSUKI - Personaje Enviado* 📚✨\n\n` +
            `🎉 El personaje *"${name}"* ha sido enviado al staff\n\n` +
            `📊 *Datos enviados:*\n` +
            `• Nombre: ${name}\n` +
            `• Género: ${gender}\n` +
            `• Valor: ${value}\n` +
            `• Origen: ${source}\n\n` +
            `⏰ *Estado:* Pendiente de aprobación\n\n` +
            `📚 "El staff revisará tu solicitud"\n` +
            `🍱 ¡Gracias por tu aporte!`,
            m, ctxOk
        )
    } catch (e) {
        await conn.reply(m.chat, 
            `🍙❌ *ITSUKI - Error al Enviar*\n\n` +
            `⚠️ No se pudo enviar el personaje al staff\n\n` +
            `📝 Error: ${e.message}\n\n` +
            `📚 "Intenta nuevamente más tarde"`,
            m, ctxErr
        )
    }
}

handler.command = ['addcharacter', 'addrw', 'addpersonaje']
handler.tags = ['gacha']
handler.help = ['addcharacter']

export default handler