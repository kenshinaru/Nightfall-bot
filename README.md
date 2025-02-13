![Alt Text](https://files.catbox.moe/7rd8t5.jpg)
### Instalasi

```js
$ git clone https://github.com/kenshinaru/Nightfall-bot.git
$ cd Nightfall-bot
$ npm install

// Buka file `setting.js` dan edit pengaturan berikut:  
export default {
  owner: '6281310994964',
  owner_name: "Luthfi Joestars",
  prefixes: ["!", ".", "#", "/"],
  limit: 25,
  pairing: {
    state: true,
    number: 6281310994964
  }
}
//lalu
$ npm start
```

### Struktur Direktori
```js
│── cmd/             # Folder plugin
│── utils/           # Library pendukung bot
│── events/          # controller/message.upsert
│── client.js        # Pengaturan bot
│── index.js         # File utama
│── package.json     # Dependensi proyek
│── setting.js       # Konfigurasi bot
```

### Example plugins
```js
export default {
  name: ["hello"],
  command: ["hello"],
  run: async(m, { sock, text }) => {
    return m.reply("Halo, apa kabar?")
  }
}
```

### Example Case
```js
case 'hi': {
  m.reply('halo')
}
 break
```

### Catatan
- Tersedia fitur untuk menambahkan case dan plugins secara otomatis.
- Pastikan semua plugin diekspor dalam format ESM (export default).
- Script ini akan dikembangkan terus.
- Terima kasih kepada creator-creator scraper yang suka berbagi di channel 🫡.

### 📡 Information 
[![WhatsApp Group](https://img.shields.io/badge/WhatsApp%20Group-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/IAeLNlXD1Y1BogudzDlGiV)
[![WhatsApp channel](https://img.shields.io/badge/WhatsApp%20Channel-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029VaXH9kE0G0XZqZFYKo0K)

Made with ❤️ by Luthfi Joestars
