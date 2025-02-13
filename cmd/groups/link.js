export default {
  name: ["linkgc"],
  command: ["linkgc"],
  tags: ["group"],
  run: async (m, { sock, command }) => {
    m.reply(`https://chat.whatsapp.com/` + await sock.groupInviteCode(m.chat));
  },
  wait: true,
  group: true,
  botadmin: true,
  update: Date.now(),
};