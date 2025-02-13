export default {
  owner: '6281310994964',
  owner_name: "Luthfi Joestars",
  prefixes: ["!", ".", "#", "/"],
  limit: 25,
  pairing: {
    state: true,
    number: 6281310994964
  },
}

global.status = Object.freeze({
    owner: "Features can only be accessed owner!",
    group: "Features only accessible in group!",
    private: "Features only accessible private chat!",
    admin: "Features can only be accessed by group admin!",
    botAdmin: "Bot is not admin, can't use the features!",
    bot: "Features only accessible by me",
    wait: "Wait a minute...",
    premium: "Premium Only Features!"
  })