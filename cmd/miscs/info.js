export default {
   name: ['sc'],
   command: ['sc', 'source', 'script'],
   tags: 'miscs',
   run: async (m, { sock }) => {
      const message = `Berikut source code bot ini, silakan dikembangkan lebih lanjut.\n\n` +
         `- *Link* : https://github.com/kenshinaru/autoread\n` +
         `- *Creator* : Luthfi Joestars\n\n` +
         `Jangan lupa kasih ⭐ di repository :D`
      sock.reply(m.chat, message, m)
   },
   owner: false
}
