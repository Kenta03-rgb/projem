// sunucu/api.js
const express = require('express');
const db = require('./veritabani');
const uygulama = express();
const PORT = 3000;

uygulama.use(express.json());

// Basit ping endpoint (sunucu çalışıyor mu kontrolü için)
uygulama.get('/ping', (req, res) => {
  res.sendStatus(200);
});

// 1) Giriş Doğrulama
uygulama.post('/api/dogrula', (req, res) => {
  const { kullaniciAdi, sifre, lisans } = req.body;

  const sorgu = `
    SELECT * FROM kullanicilar 
    WHERE kullaniciAdi = ? AND sifre = ? AND lisansAnahtari = ?
  `;
  db.get(sorgu, [kullaniciAdi, sifre, lisans], (err, row) => {
    if (err) {
      return res.json({ basari: false, mesaj: 'Sunucu hatası' });
    }
    if (row) {
      // Kullanıcı bulundu
      res.json({ basari: true });
    } else {
      res.json({ basari: false, mesaj: 'Geçersiz kullanıcı veya lisans' });
    }
  });
});

// 2) Ürün Listesi
uygulama.get('/api/urunler', (req, res) => {
  db.all('SELECT * FROM urunler', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ hata: 'Veritabanı hatası' });
    }
    res.json(rows);
  });
});

// 3) Barkod ile Ürün Getir (Tek bir ürünü döndürmek için)
uygulama.get('/api/urun/:barkod', (req, res) => {
  const barkod = req.params.barkod;
  db.get('SELECT * FROM urunler WHERE barkod = ?', [barkod], (err, row) => {
    if (err) {
      return res.status(500).json({ hata: 'Veritabanı hatası' });
    }
    if (!row) {
      return res.status(404).json({ hata: 'Ürün bulunamadı' });
    }
    res.json(row);
  });
});

// 4) Satış Kaydet (Sepetteki ürünleri gönderip veritabanına kaydedelim)
uygulama.post('/api/satis', (req, res) => {
  // Gönderilen veride sepet listesi, toplam, vb. olacak
  const { sepet, toplam } = req.body;

  if (!sepet || sepet.length === 0) {
    return res.status(400).json({ hata: 'Sepet boş' });
  }

  // 1) satislar tablosuna kayıt ekle
  const tarih = new Date().toISOString();
  db.run(
    `INSERT INTO satislar (tarih, toplam) VALUES (?, ?)`,
    [tarih, toplam],
    function(err) {
      if (err) {
        return res.status(500).json({ hata: 'Satış kaydı eklenemedi' });
      }
      const satisId = this.lastID; // Eklenen satışın ID'si

      // 2) satis_detay tablosuna sepet ürünlerini ekle
      const detaySorgu = `
        INSERT INTO satis_detay (satis_id, urun_id, miktar, birim_fiyat, toplam)
        VALUES (?, ?, ?, ?, ?)
      `;

      // Her ürün için ekleme yapalım
      sepet.forEach(item => {
        // Barkoddan urun_id bulmak için bir sorgu yapabiliriz
        db.get('SELECT id FROM urunler WHERE barkod = ?', [item.barkod], (err, urunRow) => {
          if (err) {
            console.error('Ürün sorgu hatası:', err);
            return;
          }
          if (!urunRow) {
            console.error('Ürün bulunamadı (barkod):', item.barkod);
            return;
          }
          const urunId = urunRow.id;
          const miktar = item.miktar;
          const birimFiyat = item.fiyat;
          const araToplam = item.toplam;

          db.run(detaySorgu, [satisId, urunId, miktar, birimFiyat, araToplam], err => {
            if (err) {
              console.error('Satış detay ekleme hatası:', err);
            }
          });

          // İsteğe göre stok düşümü de yapabilirsin
          db.run(`UPDATE urunler SET stok = stok - ? WHERE id = ?`, [miktar, urunId]);
        });
      });

      // Hepsi tamam
      res.json({ basari: true, satisId });
    }
  );
});

uygulama.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
