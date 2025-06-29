# EduNomo - AI Eğitim Materyali Oluşturucu

Modern, güvenli ve profesyonel bir PHP tabanlı eğitim platformu. Yapay zeka destekli materyal oluşturma, güvenli iletişim formu ve gelişmiş kullanıcı deneyimi sunar.

## 🚀 Özellikler

### ✨ Temel Özellikler
- **Yapay Zeka Destekli İçerik Oluşturma**: Google Gemini API ile güçlendirilmiş
- **Güvenli İletişim Formu**: CSRF koruması, rate limiting ve spam önleme
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Karanlık/Aydınlık Tema**: Kullanıcı tercihi ile tema değiştirme
- **SEO Optimizasyonu**: Meta etiketler, structured data ve performans optimizasyonu

### 🔒 Güvenlik Özellikleri
- CSRF token koruması
- XSS ve SQL injection koruması
- Rate limiting sistemi
- Güvenli başlıklar (Security Headers)
- Input sanitization ve validation
- Kapsamlı error logging

### 📊 Performans Özellikleri
- Gzip sıkıştırma
- Browser caching
- Lazy loading
- Optimized assets
- Database connection pooling

## 🛠️ Kurulum

### Gereksinimler
- PHP 7.4 veya üzeri
- MySQL 5.7 veya üzeri
- Apache/Nginx web sunucusu
- Composer (opsiyonel)

### Adım Adım Kurulum

1. **Projeyi İndirin**
   ```bash
   git clone https://github.com/your-username/edunomo.git
   cd edunomo
   ```

2. **Environment Dosyasını Oluşturun**
   ```bash
   cp .env.example .env
   ```

3. **Environment Değişkenlerini Ayarlayın**
   `.env` dosyasını düzenleyin:
   ```env
   ENVIRONMENT=production
   DB_HOST=localhost
   DB_NAME=edunomo
   DB_USER=your_db_user
   DB_PASS=your_db_password
   MAIL_HOST=smtp.gmail.com
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Veritabanını Oluşturun**
   ```sql
   CREATE DATABASE edunomo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **PHPMailer'ı Yükleyin**
   ```bash
   composer require phpmailer/phpmailer
   ```
   
   Veya manuel olarak [PHPMailer](https://github.com/PHPMailer/PHPMailer) indirip `vendor/` klasörüne yerleştirin.

6. **Dosya İzinlerini Ayarlayın**
   ```bash
   chmod 755 logs/
   chmod 644 config/
   chmod 644 classes/
   ```

7. **Web Sunucusunu Yapılandırın**
   - Apache için `.htaccess` dosyası hazır
   - Nginx için örnek yapılandırma:
   ```nginx
   location / {
       try_files $uri $uri/ /index.php?$query_string;
   }
   
   location /api/ {
       try_files $uri $uri/ /api/index.php?$query_string;
   }
   ```

## 📁 Proje Yapısı

```
edunomo/
├── api/                    # API endpoints
│   ├── contact.php        # İletişim formu API
│   └── csrf.php          # CSRF token API
├── classes/               # PHP sınıfları
│   ├── Logger.php        # Log yönetimi
│   └── MailService.php   # Mail servisi
├── config/               # Yapılandırma dosyaları
│   ├── database.php     # Veritabanı bağlantısı
│   └── security.php     # Güvenlik fonksiyonları
├── logs/                # Log dosyaları
├── vendor/              # Composer bağımlılıkları
├── assets/              # Statik dosyalar
│   ├── css/
│   ├── js/
│   └── images/
├── .htaccess           # Apache yapılandırması
├── .env.example        # Environment örneği
├── index.php          # Ana sayfa
├── func.js            # JavaScript fonksiyonları
├── styles.css         # CSS stilleri
└── README.md          # Bu dosya
```

## 🔧 Yapılandırma

### Mail Ayarları
Gmail için App Password oluşturun:
1. Google hesabınızda 2FA'yı etkinleştirin
2. [App Passwords](https://myaccount.google.com/apppasswords) sayfasına gidin
3. Yeni bir app password oluşturun
4. Bu şifreyi `.env` dosyasındaki `MAIL_PASSWORD` alanına yazın

### API Ayarları
Google Gemini API anahtarı almak için:
1. [Google AI Studio](https://makersuite.google.com/app/apikey) sayfasına gidin
2. Yeni bir API anahtarı oluşturun
3. Anahtarı `.env` dosyasındaki `GEMINI_API_KEY` alanına yazın

### Güvenlik Ayarları
Production ortamında:
- `ENVIRONMENT=production` olarak ayarlayın
- Güçlü veritabanı şifreleri kullanın
- SSL sertifikası yükleyin
- Firewall kurallarını yapılandırın

## 🚀 Kullanım

### İletişim Formu
```javascript
// CSRF token ile güvenli form gönderimi
const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Merhaba!',
        csrf_token: window.CSRF_TOKEN
    })
});
```

### Veritabanı Kullanımı
```php
// Güvenli veritabanı sorguları
$db = Database::getInstance();
$stmt = $db->query(
    "SELECT * FROM users WHERE email = ?", 
    [$email]
);
$user = $stmt->fetch();
```

### Log Kayıtları
```php
// Farklı log seviyeleri
Logger::info("Kullanıcı giriş yaptı", ['user_id' => 123]);
Logger::warning("Şüpheli aktivite", ['ip' => $ip]);
Logger::error("Veritabanı hatası", ['error' => $e->getMessage()]);
```

## 🔍 Monitoring ve Debugging

### Log Dosyaları
- Günlük log dosyaları: `logs/YYYY-MM-DD.log`
- JSON formatında structured logging
- IP adresi, user agent ve timestamp bilgileri

### Hata Ayıklama
Development modunda:
```env
ENVIRONMENT=development
```
Bu mod etkinleştirildiğinde detaylı hata mesajları görüntülenir.

## 🛡️ Güvenlik

### Implemented Security Measures
- **CSRF Protection**: Her form için token doğrulaması
- **XSS Prevention**: Tüm kullanıcı girdileri sanitize edilir
- **SQL Injection Protection**: Prepared statements kullanımı
- **Rate Limiting**: IP bazlı istek sınırlaması
- **Security Headers**: XSS, clickjacking ve diğer saldırılara karşı koruma
- **Input Validation**: Sunucu tarafında kapsamlı doğrulama

### Best Practices
- Hassas bilgileri environment variables'da saklayın
- Düzenli olarak bağımlılıkları güncelleyin
- Log dosyalarını düzenli olarak kontrol edin
- Backup stratejinizi uygulayın

## 📈 Performans Optimizasyonu

### Implemented Optimizations
- Gzip compression
- Browser caching headers
- Lazy loading for images
- Minified CSS/JS (production)
- Database query optimization
- CDN kullanımı (Font Awesome, Google Fonts)

### Monitoring
- Response time tracking
- Error rate monitoring
- Database performance metrics
- User experience analytics

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 Destek

Sorularınız için:
- Email: info@edunomo.com
- GitHub Issues: [Issues sayfası](https://github.com/your-username/edunomo/issues)

## 🔄 Changelog

### v3.0.0 (2025-01-XX)
- ✨ Gelişmiş güvenlik sistemi
- 🔒 CSRF koruması eklendi
- 📊 Kapsamlı logging sistemi
- 🎨 Modern UI/UX iyileştirmeleri
- 🚀 Performans optimizasyonları
- 📱 Mobil uyumluluk iyileştirmeleri

### v2.0.0
- 🧠 AI materyal oluşturma
- 📧 İletişim formu
- 🎨 Responsive tasarım

### v1.0.0
- 🎉 İlk sürüm