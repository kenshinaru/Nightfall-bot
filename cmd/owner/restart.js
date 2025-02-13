import { schema } from '../../utils/schema.js'
const machine = new schema();

export default {
  name: ["restart"],
  command: ["restart"],
  tags: ["owner"],
  run: async (m, { sock }) => {
    await sock.reply(m.chat, "Restarting bot...", m);
    await machine.save(global.db);
    await new Promise(resolve => setTimeout(resolve, 3000))
    process.send("reset");
  },
  owner: true,
};