export default {
   name: ['open', 'close'],
   command: ['open', 'close'],
   tags: 'group',
   group: true,
   admin: true,
   botAdmin: true,
   run: async (m, { sock, command }) => {
      if (command === 'open') {
         return await sock.groupSettingUpdate(m.chat, 'not_announcement');
      } 
      if (command === 'close') {
         return await sock.groupSettingUpdate(m.chat, 'announcement');
      }
   }
};