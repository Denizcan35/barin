# Türkçe Fiş OCR Sistemi

Modern Telegram bot entegrasyonu ile Türkçe fiş OCR işlemi ve KDV takip sistemi.

## Özellikler

- 🤖 **Telegram Bot**: Fiş fotoğraflarını gönder, otomatik OCR işlemi
- 📸 **OCR İşlemi**: Tesseract.js ile Türkçe optimizasyonu
- 💰 **KDV Hesaplama**: Otomatik %10 KDV ve net tutar hesaplama
- 📊 **Web Dashboard**: Modern, responsive tasarım
- 📈 **İstatistikler**: Aylık raporlar ve kullanıcı analizi
- 📁 **Excel Export**: Filtrelenmiş veriler için Excel indirme
- 🌙 **Dark Theme**: Göz yormayan karanlık tema

## Kurulum

1. Bağımlılıkları yükle:
```bash
npm install
```

2. Environment variables ayarla:
```bash
cp .env.example .env
# .env dosyasını düzenle
```

3. Uygulamayı başlat:
```bash
npm run dev
```

## Telegram Bot Kurulumu

1. BotFather ile bot token al
2. Webhook URL'i ayarla
3. Bot komutları:
   - `/start` - Bot'u başlat
   - `/kaydet` - OCR sonucunu kaydet
   - Fiş fotoğrafı gönder

## Kullanım

1. Telegram bot'una fiş fotoğrafı gönder
2. OCR sonuçlarını kontrol et
3. `/kaydet` komutu ile onayla
4. Web dashboard'da görüntüle ve yönet

## API Endpoints

- `POST /api/telegram/webhook` - Telegram webhook
- `GET /api/receipts` - Fişleri listele
- `PUT /api/receipts/:id` - Fiş güncelle
- `DELETE /api/receipts/:id` - Fiş sil
- `GET /api/receipts/export/excel` - Excel export
- `GET /api/stats` - Dashboard istatistikleri

## Teknik Detaylar

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Express.js, SQLite
- **OCR**: Tesseract.js (Türkçe optimizasyonu)
- **Bot**: node-telegram-bot-api
- **Export**: SheetJS (xlsx)

## Deployment

Netlify'a tek tıkla deploy:
1. Build komutunu çalıştır
2. Webhook URL'i güncelle
3. Environment variables ayarla