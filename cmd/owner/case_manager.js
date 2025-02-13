import fs from "fs"
import pkg from "js-beautify"
const { js } = pkg

export default {
  name: ["+case", "-case"],
  command: ["+case", "addcase", "-case", "delcase"],
  tags: ["owner"],
  run: async (m, { sock, command, text }) => {
    let filePath = `./cmd/case.js`
    if (!fs.existsSync(filePath)) return sock.reply(m.chat, `🚩 File case.js tidak ditemukan!`, m)

    text = text || (m.quoted && m.quoted.body) || ""
    if (!text) return sock.reply(m.chat, `🚩 Harap berikan nama atau isi case!`, m)

    let fileContent = await fs.readFileSync(filePath, "utf-8")

    // **Menambahkan Case Baru**
    if (command === "addcase" || command === "+case") {
      if (!text.includes('break')) return sock.reply(m.chat, `🚩 Case harus mengandung 'break' !`, m)

      let insertIndex = fileContent.lastIndexOf("break") + 6
      if (insertIndex === 5) return sock.reply(m.chat, `🚩 Tidak dapat menemukan statement 'break;' yang benar.`, m)

      let newCase = `${text}\n`
      let updatedContent = fileContent.slice(0, insertIndex) + newCase + fileContent.slice(insertIndex)

      fs.writeFileSync(filePath, js(updatedContent))
      return await sock.reply(m.chat, `✅ Case berhasil ditambahkan!`, m)
    }

    // **Menghapus Case**
    if (command === "delcase" || command === "-case") {
      let regex = new RegExp(`case\\s+['"]?${text}['"]?\\s*:\\s*{?`, "i")
      let match = regex.exec(fileContent)
      if (!match) return sock.reply(m.chat, `🚩 Case "${text}" tidak ditemukan!`, m)

      let start = match.index
      let end = fileContent.indexOf("break", start)
      if (end === -1) return sock.reply(m.chat, `🚩 Case "${text}" tidak lengkap!`, m)

      let afterBreakIndex = end + 6
      let nextCaseIndex = fileContent.indexOf("case ", afterBreakIndex)
      let nextDefaultIndex = fileContent.indexOf("default:", afterBreakIndex)
      let stopIndex = Math.min(
        nextCaseIndex !== -1 ? nextCaseIndex : Infinity,
        nextDefaultIndex !== -1 ? nextDefaultIndex : Infinity
      )

      if (stopIndex === Infinity) stopIndex = afterBreakIndex

      let caseContent = fileContent.substring(start, stopIndex)
      let updatedContent = fileContent.replace(caseContent, "").replace(/\n\s*\n/g, "\n")

      fs.writeFileSync(filePath, js(updatedContent))
      return await sock.reply(m.chat, `✅ Case "${text}" berhasil dihapus!`, m)
    }
  },
  wait: true,
  owner: true
}