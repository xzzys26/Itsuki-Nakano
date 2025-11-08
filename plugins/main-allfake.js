import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

let AraChu2 = {
  getRandom: () => 'https://files.catbox.moe/9cbbyf.jpg'
}

let owner = ['16503058299']
let conn = {
  getName: (jid) => 'Bot Owner'
}

let author = 'Itsuki-IA'
let sgc = 'https://instagram.com'
let sig = 'https://instagram.com'
let sfb = 'https://facebook.com'
let snh = 'https://tiktok.com'
let syt = 'https://youtube.com'

global.docs = ['doc1', 'doc2', 'doc3']
global.nomorown = '18493907272@s.whatsapp.net'
global.logo = 'https://raw.githubusercontent.com/WillZek/Storage-CB2/main/images/54dfe27a73cf.jpg'
global.iconorcanal = 'https://raw.githubusercontent.com/WillZek/Storage-CB2/main/images/54dfe27a73cf.jpg'
global.metanombre = 'Meta AI'

global.idchannel = '120363404434164076@newsletter'
global.namechannel = '𝆺𝅥 𝆭 ִ ֗ 🍉 𝐈𝐭𝐬𝐮𝐤𝐢 ┆ 𝐍𝐚𝐤𝐚𝐧𝐨𝐯2 𝐏𝐫𝐞𝐦𝐁𝐨𝐭 ✨ ౨ৎ˚₊‧'
let icono = 'https://files.catbox.moe/ncb958.jpg'
let iconoden = 'https://raw.githubusercontent.com/WillZek/Storage-CB2/main/images/d110942e81b3.jpg'
let iconodev = 'https://raw.githubusercontent.com/WillZek/Storage-CB2/main/images/d110942e81b3.jpg' 

global.rwait = '🕒'
global.done = '✅'
global.error = '✖️'
global.msm = '⚠️'

global.emoji = '🌺'
global.emoji2 = '🌸'
global.emoji3 = '⚡️'
global.emoji4 = '🌟'
global.emoji5 = '☕️'

global.wait = '🌸 Espera un momento...'
global.waitt = '🌸 Espera un momento...'
global.waittt = '🌸 Espera un momento...'
global.waitttt = '🌸 Espera un momento...'

var handler = m => m
handler.all = async function (m) {

global.getBuffer = async function getBuffer(url, options) {
  try {
    options ? options : {}
    var res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'User-Agent': 'GoogleBot',
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    })
    return res.data
  } catch (e) {
    console.log(`Error : ${e}`)
  }
}

let pp
try {
  pp = AraChu2.getRandom()
} catch (e) {
  pp = await this.profilePictureUrl(m.sender, 'image')
} finally {
  global.docss = pickRandom(global.docs)
  global.ephemeral = "86400"
  global.kontak2 = [
    [owner[0], await conn.getName(owner[0] + '16503058299@s.whatsapp.net'), 'Desarrollador del bot', 'xzzysultra@gmail.com', true],
    [owner[1], await conn.getName(owner[1] + '@s.whatsapp.net'), 'Desarrollador del bot', 'xzzysultra@gmail.com', true],
  ]
  global.pppkecil = AraChu2.getRandom()
  global.ucapan = ucapan()
  global.ppkecil = {
    contextInfo: {
      externalAdReply: {
        showAdAttribution: false,
        title: "𝆺𝅥 𝆭 ִ ֗ 🍉 𝐈𝐭𝐬𝐮𝐤𝐢 ┆ 𝐍𝐚𝐤𝐚𝐧𝐨𝐯2 𝐏𝐫𝐞𝐦𝐁𝐨𝐭 ✨ ౨ৎ˚₊‧",
        body: global.author,
  thumbnail: fs.readFileSync("./src/Images/thumbnail.jpg"),
  thumbnailUrl: global.pppkecil,
        sourceUrl: "https://whatsapp.com/channel/0029VbBQ5sf4NVioq39Efn0v",
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }

  global.adReplyS = {
    fileLength: SizeDoc(),
    seconds: SizeDoc(),
    contextInfo: {
      forwardingScore: SizeDoc(),
      externalAdReply: {
        containsAutoReply: true,
        showAdAttribution: false,
        title: "👋 " + Sapa() + Pagi(),
        body: author,
        mediaUrl: sgc,
        description: "𝆺𝅥 𝆭 ִ ֗ 🍉 𝐈𝐭𝐬𝐮𝐤𝐢 ┆ 𝐍𝐚𝐤𝐚𝐧𝐨𝐯2 𝐏𝐫𝐞𝐦𝐁𝐨𝐭 ✨ ౨ৎ˚₊‧",
        previewType: "PHOTO",
  thumbnail: fs.readFileSync("./src/Images/55111188_p0.jpg"),
        sourceUrl: "https://whatsapp.com/channel/0029VbBQ5sf4NVioq39Efn0v",
      }
    }
  }

  global.adReply = {
    fileLength: SizeDoc(),
    seconds: SizeDoc(),
    contextInfo: {
      forwardingScore: SizeDoc(),
      externalAdReply: {
        body: author,
        containsAutoReply: true,
        mediaType: 1,
        mediaUrl: sgc,
        renderLargerThumbnail: false,
        showAdAttribution: false,
        sourceId: "𝆺𝅥 𝆭 ִ ֗ 🍉 𝐈𝐭𝐬𝐮𝐤𝐢 ┆ 𝐍𝐚𝐤𝐚𝐧𝐨𝐯2 𝐏𝐫𝐞𝐦𝐁𝐨𝐭 ✨ ౨ৎ˚₊‧",
        sourceType: "PDF",
        previewType: "PDF",
        sourceUrl: sgc,
        thumbnail: fs.readFileSync("./src/Images/55111188_p0.jpg"),
        thumbnailUrl: global.logo,
        title: "👋 " + Sapa() + Pagi()
      }
    }
  }

  global.fakeig = {
    contextInfo: {
      externalAdReply: {
        showAdAttribution: false,
        mediaUrl: sig,
        mediaType: "VIDEO",
        description: "Sigue: " + sig,
        title: "👋 " + Sapa() + Pagi(),
        body: author,
        thumbnailUrl: global.logo,
        sourceUrl: sgc
      }
    }
  }

  global.fakefb = {
    contextInfo: {
      externalAdReply: {
        showAdAttribution: false,
        mediaUrl: sfb,
        mediaType: "VIDEO",
        description: "Sigue: " + sig,
        title: "👋 " + Sapa() + Pagi(),
        body: author,
        thumbnailUrl: global.logo,
        sourceUrl: sgc
      }
    }
  }

  global.faketik = {
    contextInfo: {
      externalAdReply: {
        showAdAttribution: false,
        mediaUrl: snh,
        mediaType: "VIDEO",
        description: "Sigue: " + sig,
        title: "👋 " + Sapa() + Pagi(),
        body: author,
        thumbnailUrl: global.logo,
        sourceUrl: snh
      }
    }
  }

  global.fakeyt = {
    contextInfo: {
      externalAdReply: {
        showAdAttribution: false,
        mediaUrl: syt,
        mediaType: "VIDEO",
        description: "Sigue: " + sig,
        title: "👋 " + Sapa() + Pagi(),
        body: author,
        thumbnailUrl: global.logo,
        sourceUrl: syt
      }
    }
  }

  global.metaai = {
    key: {
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      contactMessage: {
        displayName: `${global.metanombre}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${global.metanombre},;;;\nFN:${global.metanombre},\nitem1.TEL;waid=13135550002:13135550002\nitem1.X-ABLabel:Contacto\nitem2.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem2.X-ABLabel:Usuario\nEND:VCARD`,
        jpegThumbnail: null,
        thumbnail: null,
        sendEphemeral: true
      }
    },
    participant: "0@s.whatsapp.net"
  }

  global.botname = global.botname || namechannel

  global.rcanal = {
    contextInfo: {
      externalAdReply: {
        title: global.botname,
        mediaType: 2,
        previewType: "VIDEO",
        thumbnailUrl: global.iconorcanal,
        mediaUrl: "https://youtu.be/FKVuVneuwtg",
        sourceUrl: ""
      }
    }
  }

  global.rcanalw = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: idchannel,
        serverMessageId: 100,
        newsletterName: namechannel,
      },
      externalAdReply: {
        title: '𝆺𝅥 𝆭 ִ ֗ 🍉 𝐈𝐭𝐬𝐮𝐤𝐢 ┆ 𝐍𝐚𝐤𝐚𝐧𝐨𝐯2 𝐏𝐫𝐞𝐦𝐁𝐨𝐭 ✨ ౨ৎ˚₊‧',
        body: '',
        mediaUrl: null,
        description: null,
        previewType: "PHOTO",
        thumbnailUrl: icono,
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    },
  }

  global.rcanalden2 = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: idchannel,
        serverMessageId: 100,
        newsletterName: namechannel,
      },
    },
  }

  global.rcanalx = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: idchannel,
        serverMessageId: 100,
        newsletterName: namechannel,
      },
      externalAdReply: {
        title: '𝆺𝅥 𝆭 ִ ֗ 🍉 𝐈𝐭𝐬𝐮𝐤𝐢 ┆ 𝐍𝐚𝐤𝐚𝐧𝐨𝐯2 𝐏𝐫𝐞𝐦𝐁𝐨𝐭 ✨ ౨ৎ˚₊‧',
        body: '',
        mediaUrl: null,
        description: null,
        previewType: "PHOTO",
        thumbnailUrl: icono,
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    },
  }

  global.rcanalr = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: idchannel,
        serverMessageId: 100,
        newsletterName: namechannel,
      },
      externalAdReply: {
        title: '𝆺𝅥 𝆭 ִ ֗ 🍉 𝐈𝐭𝐬𝐮𝐤𝐢 ┆ 𝐍𝐚𝐤𝐚𝐧𝐨𝐯2 𝐏𝐫𝐞𝐦𝐁𝐨𝐭 ✨ ౨ৎ˚₊‧',
        body: '',
        mediaUrl: null,
        description: null,
        previewType: "PHOTO",
        thumbnailUrl: icono,
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    },
  }

  global.rcanalden = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: idchannel,
        serverMessageId: 100,
        newsletterName: namechannel,
      },
      externalAdReply: {
        title: '🔓 𝗔𝗰𝗰𝘀𝗲𝘀𝗼 𝗡𝗼 𝗣𝗲𝗿𝗺𝗶𝘁𝗶𝗱𝗼',
        body: '',
        mediaUrl: null,
        description: null,
        previewType: "PHOTO",
        thumbnailUrl: iconoden,
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    },
  }

  global.rcanaldev = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: idchannel,
        serverMessageId: 100,
        newsletterName: namechannel,
      },
      externalAdReply: {
        title: '🛠️ 𝗗𝗲𝘃',
        body: '',
        mediaUrl: null,
        description: null,
        previewType: 'PHOTO',
        thumbnailUrl: iconodev,
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    },
  }

  global.fakes = Fakes()

  global.dpptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  global.ddocx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  global.dxlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  global.dpdf = 'application/pdf'
  global.drtf = 'text/rtf'
  global.djson = 'application/json'
  global.thumbdoc = 'https://telegra.ph/file/6e45318d7c76f57e4a8bd.jpg'
  global.doc = pickRandom(["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/msword", "application/pdf", "text/rtf"])

  global.thumbnailUrl2 = [
    'https://files.catbox.moe/2jp3y8.jpg'
  ]

  global.logo = [
    'https://files.catbox.moe/2jp3y8.jpg'
  ]
}
}

function Fakes() {
  let Org = pickRandom(["18493907272"])
  let Parti = pickRandom([Org + "@s.whatsapp.net", Org + "@c.us"])
  let Remot = pickRandom(["status@broadcast", "120363047752200594@g.us"])
  let Hai = pickRandom(["¿Qué tal? ", "Hola ", "Hey "])
  let Sarapan = "👋 " + Hai + Pagi()
  let Thum = ThumbUrl()
  let fpayment = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      requestPaymentMessage: {
        currencyCodeIso4217: "USD",
        amount1000: SizeDoc(),
        requestFrom: Parti,
        noteMessage: {
          extendedTextMessage: {
            text: Sarapan
          }
        },
        expiryTimestamp: SizeDoc(),
        amount: {
          value: SizeDoc(),
          offset: SizeDoc(),
          currencyCode: "USD"
        }
      }
    }
  }
  let fpoll = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      pollCreationMessage: {
        name: Sarapan
      }
    }
  }
  let ftroli = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      orderMessage: {
        itemCount: SizeDoc(),
        status: 1,
        surface: 1,
        message: `Hola : ${moment.tz("America/Lima").format("HH:mm:ss")}`,
        orderTitle: Sarapan,
        sellerJid: Parti
      }
    }
  }
  let fkontak = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      contactMessage: {
        displayName: Sarapan,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${Sarapan},;;;\nFN:${Sarapan},\nitem1.TEL;waid=${global.nomorown.split("@")[0]}:${global.nomorown.split("@")[0]}\nitem1.X-ABLabell:Móvil\nEND:VCARD`,
        jpegThumbnail: Thum,
        thumbnail: Thum,
        sendEphemeral: true
      }
    }
  }
  let fvn = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      audioMessage: {
        mimetype: "audio/ogg; codecs=opus",
        seconds: SizeDoc(),
        ptt: true
      }
    }
  }
  let fvid = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      videoMessage: {
        title: Sarapan,
        h: Sarapan,
        seconds: SizeDoc(),
        caption: Sarapan,
        jpegThumbnail: Thum
      }
    }
  }
  let ftextt = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      extendedTextMessage: {
        text: Sarapan,
        title: `Hola : ${moment.tz("America/Lima").format("HH:mm:ss")}`,
        jpegThumbnail: Thum
      }
    }
  }
  let fliveLoc = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      liveLocationMessage: {
        caption: Sarapan,
        h: `Hola : ${moment.tz("America/Lima").format("HH:mm:ss")}`,
        jpegThumbnail: Thum
      }
    }
  }
  let ftoko = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      productMessage: {
        product: {
          productImage: {
            mimetype: "image/jpeg",
            jpegThumbnail: Thum
          },
          title: Sarapan,
          description: `Hola : ${moment.tz("America/Lima").format("HH:mm:ss")}`,
          currencyCode: "USD",
          priceAmount1000: SizeDoc(),
          retailerId: "Ghost",
          productImageCount: 1
        },
        businessOwnerJid: Parti
      }
    }
  }
  let fdocs = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      documentMessage: {
        title: Sarapan,
        jpegThumbnail: Thum
      }
    }
  }
  let fgif = {
    key: {
      participant: Parti,
      remoteJid: Remot
    },
    message: {
      videoMessage: {
        title: Sarapan,
        h: Sarapan,
        seconds: SizeDoc(),
        gifPlayback: true,
        caption: `Hola : ${moment.tz("America/Lima").format("HH:mm:ss")}`,
        jpegThumbnail: Thum
      }
    }
  }
  return pickRandom([fdocs, fgif, fkontak, fliveLoc, fpayment, fpoll, ftextt, ftoko, ftroli, fvid, fvn])
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

function SizeDoc() {
  return Math.pow(10, 15)
}

function PageDoc() {
  return Math.pow(10, 10)
}

function Sapa() {
  let Apa = pickRandom(["¿Qué tal? ", "Hola ", "Hey "])
  return Apa
}

function Pagi() {
  let waktunya = moment.tz("America/Lima").format("HH")
  let ucapin = "Buenas noches 🌙"
  if (waktunya >= 1) {
    ucapin = "Buenos días "
  }
  if (waktunya >= 4) {
    ucapin = "Buenos días "
  }
  if (waktunya > 10) {
    ucapin = "Buenas tardes "
  }
  if (waktunya >= 15) {
    ucapin = "Buenas tardes "
  }
  if (waktunya >= 18) {
    ucapin = "Buenas noches "
  }
  if (waktunya >= 24) {
    ucapin = "Buenas noches "
  }
  return ucapin
}

function ucapan() {
  const time = moment.tz('America/Lima').format('HH')
  let res = "Buenas noches "
  if (time >= 4) {
    res = "Buenos días "
  }
  if (time > 10) {
    res = "Buenas tardes "
  }
  if (time >= 15) {
    res = "Buenas tardes "
  }
  if (time >= 18) {
    res = "Buenas noches "
  }
  return res
}

function ThumbUrl() {
  return pickRandom(['https://files.catbox.moe/2jp3y8.jpg'])
}

export default handler