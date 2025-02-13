import fs from "fs";

export default {
  name: ["sf"],
  command: ["sf", "sp"],
  tags: ["owner"],
  run: async (m, { sock, prefix, command, text }) => {
    if (!m.quoted) throw `Reply your progress code.`;
    let path = `./cmd/${text}.js`;
    await fs.writeFileSync(path, m.quoted.text);
    await m.reply(`Berhasil menyimpan file`);
  },
  wait: true,
  owner: true
};