// sunucu/veritabani.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Veritabanı dosyası oluştur/bağlan
// Proje dizininde barkod.db adında bir dosya olacak
const dbYolu = path.join(__dirname, 'barkod.db');
const db = new sqlite3.Database(dbYolu, (err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err);
  } else {
    console.log('Veritabanına bağlanıldı:', dbYolu);
  }
});

// Başlangıçta tablo oluşturma (eğer yoksa)
db.serialize(() => {
  // Kullanıcılar tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS kullanicilar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kullaniciAdi TEXT UNIQUE,
      sifre TEXT,
      lisansAnahtari TEXT
    )
  `);

  // Örnek veri ekle (eğer yoksa)
  db.run(`
    INSERT OR IGNORE INTO kullanicilar (id, kullaniciAdi, sifre, lisansAnahtari)
    VALUES (1, 'admin', '1234', 'ABC-123')
  `);

  // Ürünler tablosu
  db.run(`
    CREATE TABLE IF NOT EXISTS urunler (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barkod TEXT UNIQUE,
      ad TEXT,
      fiyat REAL,
      stok INTEGER
    )
  `);

  // Örnek veri ekle (eğer yoksa)
  db.run(`
    INSERT OR IGNORE INTO urunler (id, barkod, ad, fiyat, stok)
    VALUES 
      (1, '1234567890', 'Elma', 5.00, 100),
      (2, '9876543210', 'Armut', 6.50, 50),
      (3, '1111111111', 'Süt', 12.75, 30)
  `);

  // Satışlar tablosu (temel örnek)
  db.run(`
    CREATE TABLE IF NOT EXISTS satislar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tarih TEXT,
      toplam REAL
      -- ileri aşamalarda müşteri bilgisi, kasa, vb. ekleyebilirsin
    )
  `);

  // Satış detayları tablosu (her satışın ürünlerini tutar)
  db.run(`
    CREATE TABLE IF NOT EXISTS satis_detay (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      satis_id INTEGER,
      urun_id INTEGER,
      miktar INTEGER,
      birim_fiyat REAL,
      toplam REAL,
      FOREIGN KEY(satis_id) REFERENCES satislar(id),
      FOREIGN KEY(urun_id) REFERENCES urunler(id)
    )
  `);
});

module.exports = db;
