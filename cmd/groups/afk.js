export default {
   name: ['afk'],
   command: ['afk'],
   tags: 'group',
   group: true,
   run: async (m, { sock, text, users, func }) => {
      try {
         users.afk = +new Date;
         users.afkReason = text
         users.afkObj = m;
         let tag = m.sender.split`@`[0];
         return sock.reply(m.chat, func.texted('bold', `🚩 @${tag} is now AFK!`), m);
      } catch {
         return sock.reply(m.chat, global.status.error, m);
      }
   }
};