import fs from "fs";

export default {
  name: ["gp"],
  command: ["gp"],
  tags: ["owner"],
  run: async (m, { sock, prefix, command, text }) => {
    let filePath = `./cmd/${text}.js`
    if (!fs.existsSync(filePath)) {
      return sock.reply(m.chat, `The file ${text}.js does not exist!`, m);
    }
    let fileContent = await fs.readFileSync(filePath, "utf-8");
    await sock.reply(m.chat, fileContent, m);
  },
  wait: true,
  owner: true
};