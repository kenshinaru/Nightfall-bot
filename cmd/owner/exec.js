import util from 'util';
import cp from 'child_process';
const { exec: _exec } = cp;
const exec = util.promisify(_exec).bind(cp);
import axios from 'axios'


export default {
  command: ["=>", ">", "$"],
  run: async (m, { sock, command, func, scrap, store, setting, users, text }) => {
    if (!text) return
    if (command === "$") {
      let o;
      try {
        o = await exec(text.trimEnd());
      } catch (e) {
        o = e;
      } finally {
        const { stdout, stderr } = o;
        if (stdout?.trim()) {
          return sock.sendMessage(m.chat, { text: stdout }, { quoted: m });
        }
        if (stderr?.trim()) {
         return sock.sendMessage(m.chat, { text: stderr }, { quoted: m });
        }
      }
    }

    const code = command === "=>" ? `(async () => { return ${text} })()` : `(async () => { ${text} })()`;
    try {
      const result = await eval(code);
      if (Buffer.isBuffer(result)) {
        sock.sendMessage(m.chat, { image: result }, { quoted: m });
      } else if (typeof result === "string" && /^data:image\/[a-z]+;base64,/.test(result)) {
        const base64Data = result.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        sock.sendMessage(m.chat, { image: buffer }, { quoted: m });
      } else {
        sock.sendMessage(m.chat, { text: util.format(result) }, { quoted: m });
      }
    } catch (e) {
      sock.sendMessage(m.chat, { text: util.format(e) }, { quoted: m });
    }
  },
  noPrefix: true,
  wait: true,
  owner: true
};