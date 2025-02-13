import baileys, { extractMessageContent } from "baileys";
import set from '../setting.js'
import func from './functions.js'

export async function msg(sock, m, store) {
	if (m.key) {
		m.id = m.key.id;
		m.isBot = m.id.startsWith("3EB0");
		m.chat = m.key.remoteJid;
		m.isUser = m.chat.endsWith("@s.whatsapp.net");
		m.isGroup = m.chat.endsWith("@g.us");
		m.sender = m.key.fromMe ? sock.decodeJid(sock.user.id) : (m.key.participant);
		m.isOwner = [sock.decodeJid(sock.user.id).replace(/@.+/, ''), set.owner].map(v => v + '@s.whatsapp.net').includes(m.sender)

		if (m.isGroup) {
			  if (!(m.chat in store.groupMetadata)) store.groupMetadata[m.chat] = await sock.groupMetadata(m.chat);
				const groupMetadata = store.groupMetadata[m.chat];
				m.metadata = groupMetadata;
				m.participants = groupMetadata ? groupMetadata.participants : [];
				m.admins = (m.participants.reduce((memberAdmin, memberNow) => (memberNow.admin ? memberAdmin.push({ id: memberNow.id, admin: memberNow.admin }) : [...memberAdmin]) && memberAdmin, []));
				m.isAdmin = !!m.admins.find((member) => member.id === m.sender);
				m.isBotAdmin = !!m.admins.find((member) => member.id === sock.decodeJid(sock.user.id));
			}
	}

	if (m.message) {
		m.type = sock.getContentType(m.message) || Object.keys(m.message)[0];
		m.msg = extractMessageContent(m.message[m.type]);
		m.body = m.type === "conversation" ? m.message?.conversation
		: m.type == "imageMessage" ? m.message?.imageMessage?.caption
		: m.type == "videoMessage" ? m.message?.videoMessage?.caption
		: m.type == "extendedTextMessage" ? m.message?.extendedTextMessage?.text
		: m.type == "buttonsResponseMessage" ? m.message?.buttonsResponseMessage?.selectedButtonId
		: m.type == "listResponseMessage" ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId
		: m.type == "templateButtonReplyMessage" ? m.message?.templateButtonReplyMessage?.selectedId
		: m.type == "messageContextInfo" ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || m.message?.buttonsResponseMessage?.selectedButtonId
		: m.type == "interactiveResponseMessage" ? (JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)).id : ""
		m.mentions = m.msg?.contextInfo?.mentionedJid || []
                m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath;
                  if (m.isMedia) {
                m.viewOnce = m.msg?.viewOnce
                m.mime = m.msg?.mimetype;
                m.size = m.msg?.fileLength;
                m.height = m.msg?.height || "";
                m.width = m.msg?.width || "";
                  if (/webp/i.test(m.mime)) {
                m.isAnimated = m.msg?.isAnimated;
                 }
                }
		m.delete = async() => await sock.sendMessage(m.chat, { delete: m.key });
		m.download = async() => await sock.downloadMediaMessage(m);
              m.react = async (emot) => await sock.sendMessage(m.chat, { react: { text: emot, key: m.key }})
              
		m.isQuoted = !!m.msg?.contextInfo?.quotedMessage;

		if (m.isQuoted) {
			let quoted = baileys.proto.WebMessageInfo.fromObject({
				key: {
					remoteJid: m.from,
					fromMe: (m.msg.contextInfo.participant === sock.decodeJid(sock.user.id)),
					id: m.msg.contextInfo.stanzaId,
					participant: m.isGroup ? m.msg.contextInfo.participant : []
				},
				message: m.msg.contextInfo.quotedMessage
			})

			m.quoted = await msg(sock, quoted, store);
		}
	}

	m.reply = async(txt = "", options = {}) => {
		return await sock.sendMessage(options.from || m.chat, {
			text: txt,
			contextInfo: {
				mentionedJid: options.mentions || sock.parseMentions(txt) || [m.sender],
				remoteJid: options.remote || null
			}
		}, {
			quoted: options.quoted || m
		})
	}
	
	m.report = async (text, options = {}) => {
      if (typeof text == "object") {
				return sock.reply(set.owner+"@s.whatsapp.net", func.format(text), m, { mentions: [set.owner+"@s.whatsapp.net", ...sock.parseMentions(func.format(text))], ...options});
			} else {
				return sock.reply(set.owner+"@s.whatsapp.net", text,  m, {...options} );
			}
		}

	return m;
}
