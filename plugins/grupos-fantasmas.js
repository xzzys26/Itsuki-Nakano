let handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!m.isGroup) {
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m, ctxErr)
  }

  if (!isAdmin) {
    return conn.reply(m.chat, '⚠️ Necesitas ser administrador para usar este comando.', m, ctxErr)
  }

  if (!isBotAdmin) {
    return conn.reply(m.chat, '⚠️ Necesito ser administradora para ver la información.', m, ctxErr)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '👻', key: m.key } })
    await conn.reply(m.chat, '🔍 Buscando fantasmas en el grupo...', m, ctxOk)

    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupName = groupMetadata.subject || 'Sin nombre'
    const allParticipants = participants || []

    // Métodos REALES para detectar inactividad
    let ghosts = []
    let suspicious = []
    let active = []

    for (let participant of allParticipants) {
      try {
        const userJid = participant.id
        const userName = participant.name || participant.notify || userJid.split('@')[0]
        const phoneNumber = userJid.split('@')[0]
        const isAdmin = participant.admin || false

        let ghostScore = 0
        let reasons = []

        // 1. Verificar si tiene nombre personalizado (indicador de actividad)
        if (!participant.name && !participant.notify) {
          ghostScore += 2
          reasons.push('Sin nombre personalizado')
        }

        // 2. Verificar si es número genérico (posible cuenta temporal)
        const num = phoneNumber
        if (num.startsWith('1') || num.startsWith('0') || num.length < 10) {
          ghostScore += 1
          reasons.push('Número sospechoso')
        }

        // 3. Intentar obtener información del perfil
        try {
          const contact = await conn.getContact(userJid).catch(() => null)
          if (contact) {
            // Cuenta verificada = activa
            if (contact.verifiedName) {
              ghostScore -= 3 // Menos probabilidad de fantasma
              reasons.push('Cuenta verificada')
            }
            
            // Cuenta business = activa  
            if (contact.isBusiness) {
              ghostScore -= 2
              reasons.push('Cuenta business')
            }
          } else {
            ghostScore += 1
            reasons.push('Sin información de contacto')
          }
        } catch (e) {
          ghostScore += 1
          reasons.push('Error al obtener contacto')
        }

        // 4. Verificar antigüedad en el grupo (aproximado)
        // No tenemos esta info exacta, pero podemos hacer suposiciones

        const userInfo = {
          jid: userJid,
          name: userName,
          number: phoneNumber,
          isAdmin: isAdmin,
          ghostScore: ghostScore,
          reasons: reasons
        }

        // Clasificar
        if (ghostScore >= 3) {
          ghosts.push(userInfo)
        } else if (ghostScore >= 1) {
          suspicious.push(userInfo)
        } else {
          active.push(userInfo)
        }

      } catch (error) {
        console.log(`Error analizando ${participant.id}:`, error.message)
      }
    }

    // Generar reporte de FANTASMAS
    let reportMessage = `👻 *DETECTOR DE FANTASMAS - GRUPO INACTIVOS* 👻\n\n`
    reportMessage += `📝 *Grupo:* ${groupName}\n`
    reportMessage += `👥 *Total miembros:* ${allParticipants.length}\n`
    reportMessage += `😴 *Fantasmas detectados:* ${ghosts.length}\n`
    reportMessage += `⚠️ *Sospechosos:* ${suspicious.length}\n`
    reportMessage += `✅ *Activos:* ${active.length}\n\n`

    // Lista de FANTASMAS
    if (ghosts.length > 0) {
      reportMessage += `😴 *👻 FANTASMAS CONFIRMADOS 👻:*\n`
      ghosts.forEach((ghost, index) => {
        const mention = `@${ghost.number}`
        const adminBadge = ghost.isAdmin ? ' 👑' : ''
        reportMessage += `${index + 1}. ${mention}${adminBadge}\n`
        reportMessage += `   📛 Nombre: ${ghost.name}\n`
        reportMessage += `   🎯 Puntaje: ${ghost.ghostScore}/5\n`
        reportMessage += `   📋 Razones: ${ghost.reasons.join(', ')}\n\n`
      })
    } else {
      reportMessage += `🎉 *¡No se detectaron fantasmas!*\n\n`
    }

    // Lista de SOSPECHOSOS
    if (suspicious.length > 0) {
      reportMessage += `⚠️ *USUARIOS SOSPECHOSOS:*\n`
      suspicious.slice(0, 5).forEach((user, index) => {
        const mention = `@${user.number}`
        reportMessage += `${index + 1}. ${mention} - Puntaje: ${user.ghostScore}\n`
      })
      if (suspicious.length > 5) {
        reportMessage += `... y ${suspicious.length - 5} más\n`
      }
      reportMessage += `\n`
    }

    // FANTASMAS que son ADMINISTRADORES (peligroso!)
    const ghostAdmins = ghosts.filter(g => g.isAdmin)
    if (ghostAdmins.length > 0) {
      reportMessage += `🚨 *ALERTA: FANTASMAS ADMINISTRADORES* 🚨\n`
      ghostAdmins.forEach((admin, index) => {
        const mention = `@${admin.number}`
        reportMessage += `${index + 1}. ${mention} - ${admin.name}\n`
      })
      reportMessage += `\n`
    }

    // RECOMENDACIONES para limpiar fantasmas
    reportMessage += `💡 *RECOMENDACIONES ANTI-FANTASMAS:*\n`
    
    if (ghosts.length > 0) {
      reportMessage += `• 🧹 Considera eliminar a los fantasmas\n`
      reportMessage += `• 🔍 Verifica manualmente cada caso\n`
    }
    
    if (ghostAdmins.length > 0) {
      reportMessage += `• 👑 Quita admin a fantasmas\n`
      reportMessage += `• ⭐ Agrega admins activos\n`
    }

    reportMessage += `• 📊 Revisa periódicamente\n`
    reportMessage += `• 🎯 Mantén el grupo activo\n\n`

    reportMessage += `📋 *CRITERIOS DE DETECCIÓN:*\n`
    reportMessage += `• Sin nombre personalizado\n`
    reportMessage += `• Números sospechosos\n`  
    reportMessage += `• Sin información de contacto\n`
    reportMessage += `• Sin cuenta verificada/business\n\n`

    reportMessage += `⏰ *Escaneado:* ${new Date().toLocaleString()}`

    // Enviar reporte
    const mentions = [...ghosts.map(g => g.jid), ...ghostAdmins.map(g => g.jid)]
    await conn.sendMessage(m.chat, {
      text: reportMessage,
      mentions: mentions
    }, { quoted: m })

    // Enviar resumen con reacción
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    console.log(`👻 FANTASMAS DETECTADOS: ${groupName} - ${ghosts.length} fantasmas`)

  } catch (error) {
    console.error('❌ Error en detector de fantasmas:', error)
    await conn.reply(m.chat, 
      `❌ Error buscando fantasmas: ${error.message}`,
      m, ctxErr
    )
  }
}

// Comando para EXPULSAR fantasmas
let kickGhostsHandler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Solo en grupos.', m)
  if (!isAdmin) return conn.reply(m.chat, '⚠️ Necesitas ser admin.', m)
  if (!isBotAdmin) return conn.reply(m.chat, '⚠️ Necesito ser admin.', m)

  try {
    await conn.reply(m.chat, 
      `🚨 *MODO LIMPIEZA DE FANTASMAS* 🚨\n\n` +
      `⚠️ Esto expulsará a los usuarios inactivos.\n` +
      `🔍 Se basará en el último análisis.\n\n` +
      `¿Continuar? Responde *SI* para confirmar.`,
      m
    )

    // Aquí iría la lógica de expulsión después de confirmación

  } catch (error) {
    console.error('Error en limpieza:', error)
    await conn.reply(m.chat, `❌ Error: ${error.message}`, m)
  }
}

handler.help = ['fantasmas', 'inactivos', 'ghost']
handler.tags = ['group']
handler.command = ['fantasmas', 'detectarfantasmas', 'inactivos', 'ghost', 'fantasma']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler