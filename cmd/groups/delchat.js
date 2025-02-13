export default {
   name: ['delete'],
   command: ['del'],
   tags: 'group',
   group: true,
   premium: true,
   run: async (m, { sock }) => {
      if (!m.quoted) return;
      return sock.sendMessage(m.chat, {
         delete: {
            remoteJid: m.chat,
            fromMe: m.isBotAdmin ? false : true,
            id: m.quoted.id,
            participant: m.quoted.sender
         }
      });
   }
};