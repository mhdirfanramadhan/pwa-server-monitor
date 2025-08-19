# Server Monitor PWA

Aplikasi Progressive Web App (PWA) sederhana untuk monitoring status server dengan tampilan profesional.

## Fitur

- ✅ **Monitoring Real-time**: Memantau status server secara otomatis setiap 30 detik
- ✅ **Tampilan Profesional**: Desain modern dengan gradient background dan animasi smooth
- ✅ **PWA Support**: Dapat diinstall sebagai aplikasi native di perangkat
- ✅ **Offline Detection**: Mendeteksi dan menampilkan notifikasi ketika tidak ada koneksi internet
- ✅ **Responsive Design**: Tampilan optimal di desktop dan mobile
- ✅ **Service Worker**: Caching untuk performa optimal dan offline functionality
- ✅ **Real-time Updates**: Menampilkan status terakhir, response time, dan timestamp

## Struktur File

```
pwa-server-monitor/
├── index.html          # Halaman utama aplikasi
├── style.css           # Stylesheet dengan desain profesional
├── script.js           # JavaScript untuk monitoring dan PWA functionality
├── service-worker.js   # Service Worker untuk caching dan offline support
├── manifest.json       # PWA manifest file
└── README.md          # Dokumentasi ini
```

## Cara Penggunaan

### 1. Setup Lokal

1. Extract file proyek ke direktori yang diinginkan
2. Buka terminal/command prompt di direktori proyek
3. Jalankan server HTTP lokal:
   ```bash
   # Menggunakan Python 3
   python3 -m http.server 8080
   
   # Atau menggunakan Python 2
   python -m SimpleHTTPServer 8080
   
   # Atau menggunakan Node.js (jika terinstall)
   npx http-server -p 8080
   ```
4. Buka browser dan akses `http://localhost:8080`

### 2. Konfigurasi Server

Edit file `script.js` pada bagian `SERVER_CONFIG` untuk mengubah server yang dimonitor:

```javascript
const SERVER_CONFIG = {
    name: 'Nama Server Anda',
    url: 'http://your-server.com:port/',
    checkInterval: 30000, // Interval pengecekan dalam ms (30 detik)
    timeout: 10000 // Timeout request dalam ms (10 detik)
};
```

### 3. Install sebagai PWA

1. Buka aplikasi di browser (Chrome/Edge/Firefox)
2. Klik ikon "Install" di address bar atau menu browser
3. Aplikasi akan terinstall sebagai aplikasi native
4. Dapat diakses dari desktop/home screen

## Fitur Monitoring

### Status Server
- **🟢 Server Aktif**: Server merespons dengan baik
- **🔴 Server Tidak Aktif**: Server tidak merespons atau error
- **🟡 Memeriksa...**: Sedang dalam proses pengecekan

### Informasi yang Ditampilkan
- **Nama Server**: Nama server yang dimonitor
- **URL Server**: Alamat server yang dimonitor
- **Status Terakhir**: Waktu pengecekan terakhir
- **Response Time**: Waktu respons server dalam millisecond
- **Status Koneksi**: Status koneksi internet user

### Fitur Offline
- Deteksi otomatis ketika tidak ada koneksi internet
- Notifikasi merah di bagian atas: "Anda sedang tidak memiliki koneksi internet"
- Status server otomatis berubah menjadi offline
- Monitoring dihentikan sementara hingga koneksi kembali

## Teknologi yang Digunakan

- **HTML5**: Struktur aplikasi
- **CSS3**: Styling dengan gradient, animations, dan responsive design
- **Vanilla JavaScript**: Logic aplikasi tanpa framework
- **Service Worker**: Caching dan offline functionality
- **PWA Manifest**: Konfigurasi Progressive Web App
- **Fetch API**: HTTP requests untuk monitoring server

## Browser Support

- ✅ Chrome 45+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Server Selalu Menunjukkan Offline
- Pastikan URL server benar dan dapat diakses
- Periksa CORS policy pada server target
- Coba akses server langsung di browser

### PWA Tidak Bisa Diinstall
- Pastikan menggunakan HTTPS (atau localhost untuk development)
- Periksa manifest.json sudah benar
- Pastikan service worker terdaftar dengan benar

### Notifikasi Offline Tidak Muncul
- Periksa JavaScript console untuk error
- Pastikan browser mendukung online/offline events
- Coba refresh halaman

## Pengembangan Lebih Lanjut

Aplikasi ini dapat dikembangkan dengan fitur tambahan:

- Multiple server monitoring
- Push notifications
- Historical data dan grafik
- Alert system via email/SMS
- Dashboard admin
- Export data ke CSV/JSON

## Lisensi

Aplikasi ini dibuat untuk keperluan monitoring server sederhana. Silakan modifikasi sesuai kebutuhan.

---

© 2025 Server Monitor PWA - Dibuat dengan ❤️ menggunakan HTML, CSS, dan JavaScript



## Deployment ke Vercel (dengan Proxy untuk Server HTTP)

Jika server monitoring Anda tidak mendukung HTTPS, Anda dapat mendeploy aplikasi ini ke Vercel dan menggunakan Vercel Serverless Function sebagai proxy untuk mengatasi masalah Mixed Content.

### Struktur Proyek Setelah Penambahan Proxy

```
pwa-server-monitor/
├── api/
│   └── proxy.js        # Vercel Serverless Function sebagai proxy
├── index.html
├── style.css
├── script.js
├── service-worker.js
├── manifest.json
└── README.md
```

### Langkah-langkah Deployment ke Vercel

1.  **Pastikan Anda memiliki akun Vercel** dan Vercel CLI terinstal (`npm i -g vercel`).
2.  **Login ke Vercel CLI** dari terminal di direktori `pwa-server-monitor`:
    ```bash
    vercel login
    ```
3.  **Deploy proyek Anda**:
    ```bash
    vercel deploy
    ```
    Ikuti petunjuk di terminal. Vercel akan secara otomatis mendeteksi file `api/proxy.js` sebagai Serverless Function dan `index.html` sebagai aplikasi frontend.
4.  **Akses aplikasi Anda** melalui URL yang diberikan oleh Vercel (misalnya `https://your-project-name.vercel.app`).

Dengan konfigurasi ini, aplikasi PWA Anda akan memanggil `/api/proxy` (melalui HTTPS) yang kemudian akan meneruskan permintaan ke server monitoring Anda (`http://tassby.kozow.com:8074/`). Respons dari server monitoring akan dikembalikan melalui proxy ke aplikasi PWA Anda, semua dalam konteks HTTPS, sehingga tidak ada lagi masalah Mixed Content.

**Penting:** Pastikan Anda telah mengupdate file `script.js` di proyek lokal Anda dengan perubahan yang saya berikan sebelumnya, yang mengarahkan permintaan ke `/api/proxy`.


