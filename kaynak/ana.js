const { app, BrowserWindow, Menu } = require('electron');
const express = require('express');  // Express.js'i dahil ediyoruz
const path = require('path');
const appServer = express();  // Yeni Express uygulaması oluşturuyoruz

// Express.js ile /ping endpoint'ini ekliyoruz
appServer.get('/ping', (req, res) => {
  res.sendStatus(200);  // 200 OK yanıtı gönderiyoruz
});

// Express sunucusunu başlatıyoruz
appServer.listen(3001, () => {
  console.log('Express sunucu 3001 portunda çalışıyor');
});

// Electron pencere fonksiyonu
function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,  // Uygulama tam ekran açılır
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,  // Basitlik için
    }
  });

  // Electron menü çubuğunu tamamen kaldırıyoruz
  Menu.setApplicationMenu(null);

  // genel klasöründeki index.html dosyasını yüklüyoruz
  win.loadFile(path.join(__dirname, '../genel/index.html'));
}

// Uygulama hazır olduğunda pencereyi oluşturuyoruz
app.whenReady().then(() => {
  createWindow();

  // Express sunucusunu çalıştırıyoruz
  appServer.listen(3002, () => {
    console.log('Sunucu 3002 portunda çalışıyor');
  });
});

// Tüm pencereler kapandığında uygulamayı kapatıyoruz
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
