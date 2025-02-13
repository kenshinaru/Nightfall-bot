import baileys, { generateWAMessageFromContent } from "baileys";

export default {
   name: ['add', 'promote', 'demote', 'kick'],
   command: ['add', 'promote', 'demote', 'kick'],
   tags: 'group',
   run: async (m, { sock, text, command }) => {
      let input = text ? text : m.quoted ? m.quoted.sender : m.mentionedJid.length > 0 ? m.mentioneJid[0] : false
      if (!input) return sock.reply(m.chat, `Mention atau balas chat target.`, m);

      let p = await sock.onWhatsApp(input.trim());
      if (!p.length) return sock.reply(m.chat, `Nomor tidak valid.`, m);

      let jid = sock.decodeJid(p[0].jid);
      let number = jid.replace(/@.+/, '');
      let info = await sock.groupMetadata(m.chat);
      let member = info.participants.find(u => u.id === jid);

      if (command === 'kick') {
         if (!member) return sock.reply(m.chat, `@${number} tidak ada dalam grup.`, m);
         await sock.groupParticipantsUpdate(m.chat, [jid], 'remove');
         m.reply(`@${number} telah dikeluarkan.`);
      } else if (command === 'add') {
         if (member) return sock.reply(m.chat, `@${number} sudah ada dalam grup.`, m);
         let result = await sock.groupParticipantsUpdate(m.chat, [jid], 'add');

         if (result[0].status === '200') return m.reply(`@${number} telah ditambahkan.`);
         if (result[0].status === '409') return sock.reply(m.chat, `@${number} sudah ada dalam grup.`, m);
         if (result[0].status === '408') return sock.reply(m.chat, `@${number} baru saja keluar dari grup.`, m);
         if (result[0].status === '401') return sock.reply(m.chat, `Bot diblokir oleh @${number}.`, m);

         let pictureUrl = await sock.profilePictureUrl(m.chat, 'image').catch(() => "https://files.catbox.moe/rop1mf.jpg");
         let inviteCode = result[0].content?.content?.[0]?.attrs?.code;
         let inviteExpiration = result[0].content?.content?.[0]?.attrs?.expiration;

         if (inviteCode && inviteExpiration) {
            let groupInvite = generateWAMessageFromContent(m.chat, baileys.proto.Message.fromObject({
               "groupInviteMessage": {
                  "groupJid": m.chat,
                  "inviteCode": inviteCode,
                  "inviteExpiration": inviteExpiration,
                  "groupName": info.subject,
                  "jpegThumbnail": await fetch(pictureUrl).then(res => res.arrayBuffer()),
                  "caption": 'Undangan untuk bergabung ke grup WhatsApp.',
               }
            }), { userJid: jid });

            await sock.relayMessage(jid, groupInvite.message, { messageId: groupInvite.key.id });
            return m.reply(`Tidak dapat menambahkan ke groups. undangan grup telah dikirim ke @${number}.`);
         }
      } else if (command === 'promote' || command === 'demote') {
         if (!member) return sock.reply(m.chat, `@${number} tidak ada dalam grup.`, m);
         await sock.groupParticipantsUpdate(m.chat, [jid], command);
         m.reply(`@${number} telah ${command === 'promote' ? 'diangkat menjadi admin.' : 'diturunkan menjadi anggota biasa.'}`);
      }
   },
   group: true,
   admin: true,
   botAdmin: true
};