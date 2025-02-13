import axios from 'axios';

export default {
  name: 'qc',
  command: ['qc'],
  tags: 'convert',
  run: async (m, { sock, args, prefix, command, func }) => {
    try {
      if (!args) return sock.reply(m.chat, func.example(prefix, command, 'Hi!'), m);
      if (args.length > 30) return sock.reply(m.chat, func.texted('bold', `🚩 Max 30 character.`), m);
      const exif = global.db.setting;
      let pic;
      try {
        pic = await sock.profilePictureUrl(m.quoted ? m.quoted.sender : m.sender, 'image');
      } catch {
        pic = 'https://i.ibb.co/nsDv3ZJ/image.jpg';
      }

      const obj = {
        "type": "quote",
        "format": "png",
        "backgroundColor": "#252525",
        "width": 512,
        "height": 768,
        "scale": 2,
        "messages": [{
          "entities": [],
          "avatar": true,
          "from": {
            "id": 1,
            "name": m.quoted ? global.db.users[m.quoted.sender].name : m.pushName,
            "photo": {
              "url": pic
            }
          },
          "text": args,
          "replyMessage": {}
        }]
      };

      const json = await axios.post('https://quotly.netorare.codes/generate', obj, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const buffer = Buffer.from(json.data.result.image, 'base64');
      sock.sendSticker(m.chat, buffer, m, {
        packname: exif.sk_pack,
        author: exif.sk_author
      });
    } catch (e) {
      console.log(e);
      sock.reply(m.chat, func.texted('bold', `🚩 Can't generate sticker.`), m);
    }
  },
  error: false,
  wait: true,
  limit: true
};