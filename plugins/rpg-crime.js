let handler = async (m, { conn, usedPrefix, command }) => {
  const ctxErr = global.rcanalx || { contextInfo: { externalAdReply: { title: '❌ Error', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxWarn = global.rcanalw || { contextInfo: { externalAdReply: { title: '⚠️ Advertencia', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}
  const ctxOk = global.rcanalr || { contextInfo: { externalAdReply: { title: '✅ Acción', body: 'Itsuki Nakano IA', thumbnailUrl: 'https://qu.ax/QGAVS.jpg', sourceUrl: global.canalOficial || '' }}}

  const currency = global.currency || 'Yenes'

  if (!db.data.chats[m.chat].economy && m.isGroup) {
    return conn.reply(m.chat, `🍙📚 *ITSUKI - Sistema de Economía*\n\n❌ Los comandos de economía están desactivados en este grupo\n\n*Administrador*, activa la economía con:\n${usedPrefix}economy on\n\n📖 "No puedo procesar acciones si la economía está desactivada..."`, m, ctxErr)
  }

  let user = global.db.data.users[m.sender]
  user.lastcrime = user.lastcrime || 0
  user.coin = user.coin || 0

  // Tiempo de espera reducido a 3 minutos
  const cooldown = 3 * 60 * 1000
  const ahora = Date.now()

  if (ahora < user.lastcrime) {
    const restante = user.lastcrime - ahora
    const wait = formatTimeMs(restante)
    return conn.reply(m.chat, `🍙⏰ *ITSUKI - Tiempo de Espera*\n\n⚠️ Debes descansar antes de intentar otra acción\n\n⏱️ *Tiempo restante:* ${wait}\n\n📚 "La paciencia es una virtud... espera un poco más"`, m, ctxWarn)
  }

  user.lastcrime = ahora + cooldown

  const evento = pickRandom(crimen)
  let cantidad

  if (evento.tipo === 'victoria') {
    cantidad = Math.floor(Math.random() * 2001) + 5000
    user.coin += cantidad

    await conn.reply(m.chat, 
      `🍙✅ *ITSUKI - Acción Exitosa* 📚✨\n\n` +
      `${evento.mensaje}\n\n` +
      `💰 *Ganancia:* +¥${cantidad.toLocaleString()} ${currency}\n` +
      `🎒 *Dinero en cartera:* ¥${user.coin.toLocaleString()} ${currency}\n\n` +
      `📖 "¡Acción completada con éxito!"\n` +
      `🍱 "Recuerda depositar tu dinero en el banco"`,
      m, ctxOk
    )
  } else {
    cantidad = Math.floor(Math.random() * 1801) + 3000
    user.coin -= cantidad
    if (user.coin < 0) user.coin = 0

    await conn.reply(m.chat,
      `🍙❌ *ITSUKI - Acción Fallida* 📚⚠️\n\n` +
      `${evento.mensaje}\n\n` +
      `💸 *Pérdida:* -¥${cantidad.toLocaleString()} ${currency}\n` +
      `🎒 *Dinero en cartera:* ¥${user.coin.toLocaleString()} ${currency}\n\n` +
      `📖 "No todas las acciones salen bien..."\n` +
      `🍱 "Aprende de tus errores y vuelve a intentarlo"`,
      m, ctxWarn
    )
  }
}

handler.tags = ['economy']
handler.help = ['crimen']
handler.command = ['crimen', 'crime', 'accion']
handler.group = true

export default handler

function formatTimeMs(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  const partes = []
  if (min) partes.push(`${min} minuto${min !== 1 ? 's' : ''}`)
  partes.push(`${sec} segundo${sec !== 1 ? 's' : ''}`)
  return partes.join(' ')
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const crimen = [
  // VICTORIAS - Estilo Itsuki (académico/inteligente)
  { tipo: 'victoria', mensaje: "📚 Usaste tus conocimientos para hackear un cajero automático con un exploit del sistema y retiraste efectivo sin alertas" },
  { tipo: 'victoria', mensaje: "📖 Te infiltraste como tutora académica en una mansión y aprovechaste para tomar joyas mientras dabas clases" },
  { tipo: 'victoria', mensaje: "✏️ Falsificaste documentos académicos perfectos y los vendiste a estudiantes desesperados" },
  { tipo: 'victoria', mensaje: "🎓 Organizaste un curso falso de preparación universitaria y cobraste matrícula a decenas de estudiantes" },
  { tipo: 'victoria', mensaje: "📚 Vendiste respuestas de exámenes que obtuviste hackeando el servidor de una universidad" },
  { tipo: 'victoria', mensaje: "🍙 Abriste un restaurante temporal con comida que no tenía permisos y cerraste antes de ser descubierta" },
  { tipo: 'victoria', mensaje: "📖 Plagiaste una investigación académica, la publicaste bajo tu nombre y recibiste reconocimiento monetario" },
  { tipo: 'victoria', mensaje: "💻 Creaste una app educativa falsa que robaba datos bancarios de los usuarios" },
  { tipo: 'victoria', mensaje: "📚 Falsificaste certificados de idiomas y los vendiste online a precios elevados" },
  { tipo: 'victoria', mensaje: "🎒 Robaste libros de texto raros de una biblioteca universitaria y los revendiste a coleccionistas" },
  { tipo: 'victoria', mensaje: "📝 Manipulaste las calificaciones de estudiantes en el sistema escolar a cambio de dinero" },
  { tipo: 'victoria', mensaje: "🍱 Vendiste planes de dieta y estudio falsos que prometían resultados milagrosos" },
  { tipo: 'victoria', mensaje: "📚 Accediste al servidor de una editorial y descargaste libros digitales para revenderlos" },
  { tipo: 'victoria', mensaje: "✏️ Ofreciste servicios de escritura de tesis a cambio de grandes sumas de dinero" },
  { tipo: 'victoria', mensaje: "📖 Creaste una plataforma de cursos online falsos y cobraste suscripciones mensuales" },
  { tipo: 'victoria', mensaje: "🎓 Falsificaste un título universitario de prestigio y lo vendiste a un profesional desesperado" },
  { tipo: 'victoria', mensaje: "📚 Interceptaste un paquete con material de estudio exclusivo y lo revendiste" },
  { tipo: 'victoria', mensaje: "💻 Hackeaste una cuenta de streaming educativo premium y vendiste accesos" },
  { tipo: 'victoria', mensaje: "📝 Creaste un sitio de becas falsas y te quedaste con las cuotas de inscripción" },
  { tipo: 'victoria', mensaje: "🍙 Organizaste un evento gastronómico con comida económica pero cobraste precios premium" },
  { tipo: 'victoria', mensaje: "📚 Vendiste guías de estudio que eran copias de material protegido por derechos de autor" },
  { tipo: 'victoria', mensaje: "🎒 Robaste equipos tecnológicos de un laboratorio universitario y los vendiste" },
  { tipo: 'victoria', mensaje: "📖 Suplantaste la identidad de una profesora para dar clases particulares caras" },
  { tipo: 'victoria', mensaje: "✏️ Falsificaste cartas de recomendación académica de prestigiosas universidades" },
  { tipo: 'victoria', mensaje: "💻 Creaste bots que hacían tareas y exámenes online por dinero" },
  { tipo: 'victoria', mensaje: "📚 Vendiste acceso a una base de datos académica restringida que habías hackeado" },
  { tipo: 'victoria', mensaje: "🍱 Simulaste ser nutricionista certificada y cobraste consultas sin tener título" },
  { tipo: 'victoria', mensaje: "📝 Manipulaste un concurso académico para que ganara quien te pagó más" },
  { tipo: 'victoria', mensaje: "🎮 Creaste una aplicación de tutoría que minaba criptomonedas en segundo plano" },
  { tipo: 'victoria', mensaje: "📊 Vendiste datos de estudiantes a empresas de marketing educativo" },
  { tipo: 'victoria', mensaje: "💼 Organizaste una feria universitaria falsa y cobraste stands a empresas" },
  { tipo: 'victoria', mensaje: "📈 Creaste un esquema de inversión en 'educación tecnológica' que resultó ser piramidal" },
  { tipo: 'victoria', mensaje: "🎭 Te hiciste pasar por reclutadora de una empresa grande y vendiste 'entrevistas garantizadas'" },
  { tipo: 'victoria', mensaje: "💸 Lavaste dinero a través de una escuela de idiomas ficticia" },
  { tipo: 'victoria', mensaje: "📱 Desarrollaste un plugin para plataformas educativas que robaba información de pago" },
  { tipo: 'victoria', mensaje: "🎨 Falsificaste obras de arte académicas y las vendiste como originales" },
  { tipo: 'victoria', mensaje: "🔍 Vendiste 'accesos prioritarios' a bibliotecas digitales restringidas" },
  { tipo: 'victoria', mensaje: "💊 Creaste un suplemento 'mejorador cognitivo' falso y lo vendiste a estudiantes" },
  { tipo: 'victoria', mensaje: "📡 Interceptaste señales de transmisión de clases privadas y las revendiste" },
  { tipo: 'victoria', mensaje: "🎯 Organizaste un 'seminario de éxito académico' con contenido plagiado" },
  { tipo: 'victoria', mensaje: "💳 Clonaste tarjetas de acceso a laboratorios de investigación" },
  { tipo: 'victoria', mensaje: "📊 Vendiste estadísticas falsas de empleabilidad a universidades" },
  { tipo: 'victoria', mensaje: "🎓 Creaste una agencia de intercambios estudiantiles ficticia" },

  // DERROTAS - Estilo Itsuki
  { tipo: 'derrota', mensaje: "📚 Intentaste falsificar un certificado pero el papel y sello eran de mala calidad, te descubrieron" },
  { tipo: 'derrota', mensaje: "📖 Trataste de hackear un sistema escolar pero olvidaste ocultar tu IP y fuiste rastreada" },
  { tipo: 'derrota', mensaje: "✏️ Vendiste respuestas de examen equivocadas y los estudiantes te denunciaron" },
  { tipo: 'derrota', mensaje: "🎓 Intentaste falsificar un diploma pero usaste el logo antiguo de la universidad" },
  { tipo: 'derrota', mensaje: "📚 Robaste libros de una biblioteca pero las cámaras de seguridad te grabaron" },
  { tipo: 'derrota', mensaje: "💻 Creaste una app falsa pero fue detectada como malware y eliminada" },
  { tipo: 'derrota', mensaje: "🍙 Tu restaurante temporal fue clausurado por inspección sanitaria sorpresa" },
  { tipo: 'derrota', mensaje: "📝 Plagiaste una investigación pero el autor original te demandó y perdiste el caso" },
  { tipo: 'derrota', mensaje: "🎒 Intentaste robar equipo de laboratorio pero activaste la alarma silenciosa" },
  { tipo: 'derrota', mensaje: "📖 Vendiste cursos falsos pero los estudiantes se organizaron y te reportaron" },
  { tipo: 'derrota', mensaje: "✏️ Falsificaste una carta de recomendación pero el destinatario llamó para verificar" },
  { tipo: 'derrota', mensaje: "💻 Tu sitio de certificados falsos fue cerrado por las autoridades" },
  { tipo: 'derrota', mensaje: "📚 Intentaste vender acceso a base de datos pero era una trampa de seguridad" },
  { tipo: 'derrota', mensaje: "🍱 Te descubrieron ejerciendo sin licencia y te multaron fuertemente" },
  { tipo: 'derrota', mensaje: "📝 Manipulaste calificaciones pero el sistema tenía registro de cambios" },
  { tipo: 'derrota', mensaje: "🎓 El título falso que vendiste fue verificado y te demandaron por fraude" },
  { tipo: 'derrota', mensaje: "📚 Las respuestas de examen que vendiste eran de la versión equivocada" },
  { tipo: 'derrota', mensaje: "💻 Tu hackeo fue detectado y la universidad presentó cargos formales" },
  { tipo: 'derrota', mensaje: "📖 El curso online falso fue reportado y perdiste todo lo recaudado" },
  { tipo: 'derrota', mensaje: "🎮 Tu app minera fue detectada por antivirus y removida de las tiendas" },
  { tipo: 'derrota', mensaje: "📊 Los datos que vendiste estaban encriptados y no pudiste acceder a ellos" },
  { tipo: 'derrota', mensaje: "💼 La feria falsa fue descubierta por una empresa real que investigó" },
  { tipo: 'derrota', mensaje: "📈 Tu esquema piramidal colapsó cuando los primeros inversionistas quisieron retirar" },
  { tipo: 'derrota', mensaje: "🎭 La empresa que suplantaste tenía un sistema de verificación de identidad" },
  { tipo: 'derrota', mensaje: "💸 El banco detectó movimientos sospechosos en la cuenta de la escuela ficticia" },
  { tipo: 'derrota', mensaje: "📱 Tu plugin malicioso fue descubierto en una auditoría de seguridad" },
  { tipo: 'derrota', mensaje: "🎨 Un experto en arte identificó tus falsificaciones como réplicas" },
  { tipo: 'derrota', mensaje: "🔍 La biblioteca digital mejoró su seguridad y bloqueó tus accesos" },
  { tipo: 'derrota', mensaje: "💊 Estudiantes reportaron efectos secundarios de tu suplemento falso" },
  { tipo: 'derrota', mensaje: "📡 La transmisión interceptada tenía protección anti-piratería" },
  { tipo: 'derrota', mensaje: "🎯 Un asistente reconoció el contenido plagiado de tu seminario" },
  { tipo: 'derrota', mensaje: "💳 El sistema de laboratorio detectó las tarjetas clonadas" },
  { tipo: 'derrota', mensaje: "📊 Las universidades verificaron tus estadísticas y encontraron inconsistencias" },
  { tipo: 'derrota', mensaje: "🎓 Estudiantes denunciaron tu agencia ficticia cuando no recibieron sus visas" }
]