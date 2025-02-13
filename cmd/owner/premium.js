export default {
   name: ['+prem', '-prem'],
   command: ['+prem', '-prem'],
   tags: 'owner',
   run: async(m, { sock, text, prefix, command }) => {
      let isAdd = command === '+prem';

      if (m.quoted) {
         if (m.quoted.isBot) return sock.reply(m.chat, "Cannot modify bot premium status.", m);
         if (isAdd && text && isNaN(text)) return sock.reply(m.chat, "Day must be a number.", m);

         let days = isAdd ? (text ? parseInt(text) : 30) : 0;
         let jid = sock.decodeJid(m.quoted.sender);
         let users = global.db.users[jid]
         
         if (isAdd) {
            users.limit += 9999999;
            users.expired += users.premium ? 86400000 * days : Date.now() + 86400000 * days;
            sock.reply(m.chat, `${users.premium ? `Added ${days} days premium access` : "User added to premium"} for @${jid.replace(/@.+/, '')}.`, m);
            users.premium = true;
         } else {
            users.premium = false;
            users.limit = 20;
            users.expired = 0;
            sock.reply(m.chat, `Removed premium status for @${jid.replace(/@.+/, '')}.`, m);
         }
      } else if (m.mentions.length) {
         if (isAdd && text && isNaN(text)) return sock.reply(m.chat, "Day must be a number.", m);
         
         let days = isAdd ? (text ? parseInt(text) : 30) : 0;
         let jid = sock.decodeJid(m.mentionedJid[0]);
         let users = global.db.users[jid]
         
         if (isAdd) {
            users.limit += 9999999;
            users.expired += users.premium ? 86400000 * days : Date.now() + 86400000 * days;
            sock.reply(m.chat, `${users.premium ? `Added ${days} days premium access` : "User added to premium"} for @${jid.replace(/@.+/, '')}.`, m);
            users.premium = true;
         } else {
            users.premium = false;
            users.limit = 20;
            users.expired = 0;
            sock.reply(m.chat, `Removed premium status for @${jid.replace(/@.+/, '')}.`, m);
         }
      } else if (text && /\|/.test(text)) {
         let [number, day] = text.split`|`;
         let p = (await sock.onWhatsApp(number.startsWith('0') ? '62' + number.slice(1) : number.startsWith('+') ? number.match(/\d+/g).join('') : number))[0] || {};
         
         if (!p.exists) return sock.reply(m.chat, "Number not registered on WhatsApp.", m);
         if (isAdd && isNaN(day)) return sock.reply(m.chat, "Day must be a number.", m);

         let days = isAdd ? (day ? parseInt(day) : 30) : 0;
         let jid = sock.decodeJid(p.jid);
         let users = global.db.users[jid]
         if (!users) return sock.reply(m.chat, "Cannot find user data.", m);

         if (isAdd) {
            users.limit += 9999999;
            users.expired += users.premium ? 86400000 * days : Date.now() + 86400000 * days;
            sock.reply(m.chat, `${users.premium ? `Added ${days} days premium access` : "User added to premium"} for @${jid.replace(/@.+/, '')}.`, m);
            users.premium = true;
         } else {
            users.premium = false;
            users.limit = 20;
            users.expired = 0;
            sock.reply(m.chat, `Removed premium status for @${jid.replace(/@.+/, '')}.`, m);
         }
      } else {
         let teks = `• Example:\n\n`;
         teks += `${prefix + command} 6285xxxxx | 7\n`;
         teks += `${prefix + command} @0 7\n`;
         teks += `${prefix + command} 7 (reply chat target)`;
         sock.reply(m.chat, teks, m);
      }
   },
   owner: true
};