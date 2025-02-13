import fs from "fs";
import stable from "json-stable-stringify";

export default async (sock, m, set) => {
  let user = global.db.users[m.sender];
  if (typeof user !== "object") global.db.users[m.sender] = {};
  const isNumber = x => typeof x === 'number' && !isNaN(x);
  if (m.isUser) {
  if (user) {
    if (!('name' in user)) user.name = m.pushName
    if (!isNumber(user.afk)) user.afk = -1
    if (!('afkReason' in user)) user.afkReason = ''
    if (!('afkObj' in user)) user.afkObj = {}
    if (!('banned' in user)) user.banned = false
    if (!isNumber(user.expired)) user.expired = 0;
    if (!isNumber(user.limit)) user.limit = set.limit
  } else {
    global.db.users[m.sender] = {
      name: m.pushName,
      afk: -1,
      afkReason: '',
      afkObj: {},
      banned: false,
      expired: 0,
      limit: set.limit,
    };
  }
 }
  
  if (m.isGroup) {
      let group = global.db.groups[m.chat]
      if (group) {
         if (!isNumber(group.activity)) group.activity = 0
         if (!('antibot' in group)) group.antibot = true
         if (!('antidelete' in group)) group.antidelete = true
         if (!('antilink' in group)) group.antilink = true
         if (!('antivirtex' in group)) group.antivirtex = true
         if (!('antitoxic' in group)) group.antitoxic = false
         if (!('left' in group)) group.left = false
         if (!('mute' in group)) group.mute = true
         if (!('product' in group)) group.product = []
         if (!('member' in group)) group.member = {}
         if (!('text_left' in group)) group.text_left = ''
         if (!('text_welcome' in group)) group.text_welcome = ''
         if (!('welcome' in group)) group.welcome = false
         if (!isNumber(group.expired)) group.expired = 0
         if (!('stay' in group)) group.stay = false
      } else {
         global.db.groups[m.chat] = {
            jid: m.from,
            activity: 0,
            antibot: true,
            antidelete: true,
            antilink: false,
            antivirtex: false,
            antitoxic: false,
            left: false,
            localonly: false,
            mute: true,
            product: [],
            member: {},
            text_left: '',
            text_welcome: '',
            welcome: false,
            expired: 0,
            stay: false
         }
      }
   }
   
   
  let settings = global.db.setting
  if (typeof settings !== "object") global.db.setting = {};
  if (settings) {
    if (!("self" in settings)) settings.self = false;
    if (!('cover' in settings)) settings.cover = 'https://telegra.ph/file/b3838a7cd867ad3f1ac68.jpg'
    if (!('sk_pack' in settings)) settings.sk_pack = 'ᴡᴀʙᴏᴛ'
    if (!('sk_author' in settings)) settings.sk_author = 'ʙʏ ᴋᴇɴꜱʜɪɴ ツ'
    if (!('link' in settings)) settings.link = 'https://chat.whatsapp.com/I7utr9BOB1iKAMY6uE3Z9X'
    if (!("owners" in settings)) settings.owners = ['6281310994964'];
    if (!isNumber(settings.lastReset)) settings.lastReset = 0
  } else {
    global.db.setting= {
      self: false,
      sk_pack: 'ᴡᴀʙᴏᴛ',
      sk_author: 'ʙʏ ᴋᴇɴꜱʜɪɴ ツ',
      cover: 'https://telegra.ph/file/b3838a7cd867ad3f1ac68.jpg',
      link: 'https://chat.whatsapp.com/I7utr9BOB1iKAMY6uE3Z9X',
      owners: ['6281310994964'],
      lastReset: 0
    };
  }
}

export class schema {
  constructor() {
    this.file = "zeeta"
  }

  fetch = async () => {
    if (!fs.existsSync(this.file + '.json')) return {};
    const json = JSON.parse(fs.readFileSync(this.file + '.json', "utf-8"));
    return json;
  };

  save = async (data) => {
    const database = data ? data : global.db;
    fs.writeFileSync(this.file + '.json', stable(database, {space: 4}));
    fs.writeFileSync(this.file + '.bak', stable(database, {space: 4}));
  };
}