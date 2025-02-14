import fs from "fs";
import beautify from "js-beautify";

export default {
  name: ["sf"],
  command: ["sf", "sp"],
  tags: ["owner"],
  run: async (m, { sock, prefix, command, text }) => {
    if (!m.quoted) throw `Reply your progress code.`;
    let path = `./cmd/${text}.js`;
    let formattedCode = beautify(m.quoted.text, { indent_size: 2, space_in_empty_paren: true });
    await fs.writeFileSync(path, formattedCode);
    await m.reply(`Berhasil menyimpan file dengan format yang lebih rapi`);
  },
  wait: true,
  owner: true
};
