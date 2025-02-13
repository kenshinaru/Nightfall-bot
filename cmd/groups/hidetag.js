export default {
   name: ['totag', 'hidetag'],
   command: ['hidetag', 'totag', 'h'],
   tags: 'group',
   admin: true,
   group: true,
   run: async (m, { sock, command, args }) => {
      if (command === 'hidetag' || command === 'h') {
         let users = m.metadata.participants.map(u => u.id);
         return sock.reply(m.chat, args, m, { mentions: users });
      }
      if (command === 'totag') {
         let users = m.metadata.participants.map(u => u.id && u.id !== sock.user.id);
         if (!m.quoted) return m.reply(`✳️ Reply Pesan`);
         return sock.sendMessage(m.chat, {
            forward: m.quoted.fakeObj,
            mentions: users
         });
      }
   }
};