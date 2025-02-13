export default {
   name: ['totag', 'hidetag'],
   command: ['hidetag', 'totag', 'h'],
   tags: 'group',
   admin: true,
   group: true,
   run: async (m, { sock, command, text }) => {
      if (command === 'hidetag' || command === 'h') {
         let users = m.metadata.participants.map(u => u.id);
         return sock.reply(m.chat, text, m, { mentions: users });
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
