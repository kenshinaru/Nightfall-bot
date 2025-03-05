import { toBuffer, makeWASocket, jidDecode, downloadContentFromMessage, generateWAMessage, generateWAMessageFromContent, prepareWAMessageMedia, STORIES_JID } from "baileys";
import Exif from './exif.js'
import func from './functions.js'
import { fileTypeFromBuffer } from 'file-type'
import { Readable } from 'stream'

export function WAConnection(...args) {
	let sock = makeWASocket(...args);

   sock.replyButton = async (d, F = [], U, b = {}, i = {}) => {
  let e = [];
  for (const Y of F) {
    if (Y?.name) {
      e.push({
        nativeFlowInfo: {
          name: Y.name,
          paramsJson: JSON.stringify(Y.param),
        },
        type: "NATIVE_FLOW",
      });
    } else {
      e.push({
        buttonId: Y.command,
        buttonText: {
          displayText: Y.text,
        },
        type: "RESPONSE",
      });
    }
  }
  let M = {};
  if (b?.media) {
    const z = await func.getFile(b.media);
    if (b?.media && b?.document) {
      const w = await prepareWAMessageMedia(
        {
          document:  z.data,
          fileName: b?.document?.filename || z.filename,
          mimetype: z.mime,
        },
        { upload: sock.waUploadToServer }
      );
      M = { documentMessage: w.documentMessage };
    } else if (/image/.test(z.mime) && b?.location) {
      M = {
        locationMessage: {
          thumbnail: await func.createThumb(b.media),
        },
      };
    } else if (/image/.test(z.mime) && b?.product) {
      const w = await prepareWAMessageMedia(
        { image: z.data },
        { upload: sock.waUploadToServer }
      );
      M = { imageMessage: w.imageMessage };
    } else if (/image/.test(z.mime)) {
      const w = await prepareWAMessageMedia(
        { image: z.data },
        { upload: sock.waUploadToServer }
      );
      M = { imageMessage: w.imageMessage };
    } else if (/video/.test(z.mime)) {
      const w = await prepareWAMessageMedia(
        { video: z.data },
        { upload: sock.waUploadToServer }
      );
      M = { videoMessage: w.videoMessage };
    }
  }

  const s = generateWAMessageFromContent(
    d,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
          },
          buttonsMessage: {
            ...M,
            contentText: b?.text || '',
            footerText: b?.footer || '',
            contextInfo: {
              mentionedJid: sock.parseMentions(b?.text || ''),
              ...i,
            },
            buttons: e,
            headerType: M?.imageMessage && b?.product
              ? "PRODUCT"
              : M?.documentMessage
              ? "DOCUMENT"
              : M?.locationMessage
              ? "LOCATION"
              : M?.imageMessage
              ? "IMAGE"
              : M?.videoMessage
              ? "VIDEO"
              : "EMPTY",
          },
        },
      },
    },
    {
      userJid: sock.user.jid,
      quoted: U,
    }
  );

  await sock.sendPresenceUpdate("composing", d);
  sock.relayMessage(d, s.message, { messageId: s.key.id });
  return s;
};
	
 sock.parseMentions = (text) => {
         if (typeof text === "string") {
	const matches = text.match(/@([0-9]{5,16}|0)/g) || [];
	   return matches.map((match) => match.replace("@", "") + "@s.whatsapp.net");
	  }
     }
    
  sock.sendFile = async (jid, url, H, I, Q, options = {}) => {
    let { mime, filename, data, size } = await func.getFile(url);
    let fileName = H || filename;
    let mimetype = /audio/i.test(mime) ? "audio/mpeg" : mime;
    let stream = { stream: Readable.from(data) };

    let dataObj = { fileName, caption: I || '' };

    if (size > 45000000 || options.document) {
        dataObj = { ...dataObj, document: stream, mimetype };
    } else if (/image/.test(mime)) {
        dataObj = { ...dataObj, image: stream, mimetype: options.mimetype || "image/png" };
    } else if (/video/.test(mime)) {
        dataObj = { ...dataObj, video: stream, mimetype: options.mimetype || "video/mp4" };
    } else if (/audio/.test(mime)) {
        dataObj = { ...dataObj, audio: stream, mimetype: options.mimetype || "audio/mpeg" };
    } else {
        dataObj = { ...dataObj, document: stream, mimetype };
    }

    return sock.sendMessage(jid, dataObj, {
        quoted: Q,
        ephemeralExpiration: process?.env?.E_MSG || 0
    });
};

 sock.sendContact = async (z, D, E, F = {}, G = {}) => {
    let I = D.map(J => ({
        'displayName': J.name,
        'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:${J.name}\nFN:${J.name}\nitem1.TEL;waid=${J.number}:${J.number}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:${F.email || "luthfijoestars@gmail.com"}\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/luthfi.joestars\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
    }));

    return sock.sendMessage(z, {
        'contacts': {
            'displayName': `${I.length} Contact`,
            'contacts': I
        },
        ...G
    }, {
        'quoted': E,
        'ephemeralExpiration': process?.env?.E_MSG || 0
    });
}
 
 sock.reply = (jid, text, quoted, options = {}) => {
     sock.sendMessage(jid, {
        text: text,
        mentions: sock.parseMentions(text),
        ...options
    }, {
        quoted: quoted,
        ephemeralExpiration: process?.env?.E_MSG || 0
        });
      };
   
	sock.decodeJid = (jid) => {
		if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return decode.user && decode.server && `${decode.user}@${decode.server}` || jid;
        } else return jid;
	}

	sock.downloadMediaMessage = async(m) => {
		let quoted = m.msg ? m.msg : m;
		let stream = await downloadContentFromMessage(quoted, m.type.replace(/Message/, ""));
		let buffer = await toBuffer(stream) || Buffer.alloc(0);

		if (buffer) {
			return buffer;
		}
	}
    
    sock.sendSticker = async (z, D, E, F = {}) => {
    let G = /^https?:\/\//.test(D) ? await (await func.fetchBuffer(D)).data :
            Buffer.isBuffer(D) ? D :
            /^data:.*?\/.*?;base64,/i.test(D) ? Buffer.from(D.split(',')[1], "base64") :
            Buffer.alloc(0);

    let { mime: I } = await fileTypeFromBuffer(G);
    let J = /image\/(jpe?g|png|gif)|octet/.test(I) ? 
            F && (F.packname || F.author) ? await Exif.writeExifImg(G, F) : await Exif.imageToWebp(G) :
            /video/.test(I) ? F && (F.packname || F.author) ? await Exif.writeExifVid(G, F) : await Exif.videoToWebp(G) :
            /webp/.test(I) ? await Exif.writeExifWebp(G, F) :
            Buffer.alloc(0);

    await sock.sendPresenceUpdate("composing", z);
    return sock.sendMessage(z, {
        'sticker': { 'url': J },
        ...F
    }, {
        'quoted': E,
        'ephemeralExpiration': process?.env?.E_MSG || 0
    });
}
     
	return sock;
}
