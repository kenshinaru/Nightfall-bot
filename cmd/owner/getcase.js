import fs from "fs"

export default {
  name: ["getcase"],
  command: ["getcase"],
  tags: ["owner"],
  run: async (m, { sock, text }) => {
    let filePath = `./cmd/case.js`
    if (!fs.existsSync(filePath)) return sock.reply(m.chat, `The file case.js does not exist!`, m)
    if (!text) return sock.reply(m.chat, `Please provide a case name!`, m)

    let fileContent = await fs.readFileSync(filePath, "utf-8")
    let regex = new RegExp(`case\\s+['"]?${text}['"]?\\s*:\\s*{?`, "i")
    let match = regex.exec(fileContent)
    if (!match) return sock.reply(m.chat, `Case "${text}" not found!`, m)

    let start = match.index
    let end = fileContent.indexOf("break", start)
    if (end === -1) return sock.reply(m.chat, `Case "${text}" is incomplete or malformed!`, m)

    let caseContent = fileContent.substring(start, end + 6).trim()
    await sock.reply(m.chat, caseContent.trim(), m)
  },
  wait: true,
  owner: true
}