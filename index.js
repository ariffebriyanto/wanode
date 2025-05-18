const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('✅ Scan QR berikut:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp bot siap digunakan!');
});

client.initialize();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Bot WhatsApp aktif!');
});

app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;
  try {
    await client.sendMessage(`${number}@c.us`, message);
    console.log(`✅ Pesan dikirim ke ${number}: ${message}`);
    res.status(200).send('Pesan berhasil dikirim');
  } catch (error) {
    console.error('❌ Error kirim WA:', error);
    res.status(500).send('Gagal mengirim pesan');
  }
});

app.listen(port, () => {
  console.log(`🚀 Server aktif di http://localhost:${port}`);
});
