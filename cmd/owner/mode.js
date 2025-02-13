export default {
  name: ["self"],
  command: ["self"],
  tags: ["owner"],
  run: async (m, { sock, prefix, command, text, setting }) => {
    if (!text) return m.reply(`Usage: *${prefix + command} on/off*`);

    if (!["on", "off"].includes(text)) 
      return m.reply(`Invalid option! Please use *${prefix + command} on* or *${prefix + command} off*`);

    setting.self = text === "on";
    m.reply(`Bot mode has been successfully switched to *${setting.self ? "Self" : "Public"}* mode.`);
  },
  wait: true,
  owner: true
};