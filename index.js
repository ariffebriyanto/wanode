// ⬇️ Import modul yang dibutuhkan
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

// ⬇️ Inisialisasi client WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// ⬇️ Tampilkan QR di terminal
client.on('qr', (qr) => {
  console.log('✅ Scan QR berikut:');
  qrcode.generate(qr, { small: true });
});

// ⬇️ Status siap
client.on('ready', () => {
  console.log('✅ WhatsApp bot siap digunakan!');
});

client.initialize();

// ⬇️ Fungsi delay (untuk hindari spam)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ⬇️ Verifikasi apakah nomor terdaftar di WhatsApp
async function isRegisteredNumber(number) {
  try {
    const exists = await client.isRegisteredUser(`${number}@c.us`);
    return exists;
  } catch (err) {
    console.error('❌ Gagal cek nomor:', err);
    return false;
  }
}

// ⬇️ Middleware JSON
app.use(express.json());

// ⬇️ Tes endpoint
app.get('/', (req, res) => {
  res.send('🤖 Bot WhatsApp aktif!');
});

// ⬇️ Endpoint untuk mengirim pesan
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).send('❌ Nomor dan pesan wajib diisi');
  }

  const isValid = await isRegisteredNumber(number);
  if (!isValid) {
    return res.status(400).send('❌ Nomor tidak terdaftar di WhatsApp');
  }

  try {
    // ⬇️ Simulasikan aktivitas manusia
    await client.sendPresenceAvailable();
    await client.sendTyping(`${number}@c.us`);
    await delay(2000); // Simulasi ketik

    // ⬇️ Delay antar pesan (hindari spam)
    await delay(1500);

    // ⬇️ Kirim pesan
    await client.sendMessage(`${number}@c.us`, message);
    console.log(`✅ Pesan dikirim ke ${number}: ${message}`);
    res.status(200).send('✅ Pesan berhasil dikirim');
  } catch (error) {
    console.error('❌ Error kirim WA:', error);
    res.status(500).send('❌ Gagal mengirim pesan');
  }
});

// ⬇️ Jalankan server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server aktif di http://0.0.0.0:${port}`);
});

// ⬇️ Atur timeout 5 menit
server.setTimeout(300000);
