# HERBBOT — Robot Jamu Pintar

Robot vending jamu otomatis berbasis AI. Website React (frontend) + Express.js (backend Groq AI) + ESP32 (hardware) + Supabase (database real-time).

---

## Arsitektur

```
User → Website (React + Vite) → Supabase ← ESP32 (Arduino)
                ↓                      ↓
         Express Backend          Motor/Pump/Servo
         (Groq AI takaran)        (fisik robot jamu)
```

| Komponen | Teknologi |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion |
| Backend AI | Express.js, Groq SDK (`groq/compound-mini` / configurable) |
| Database | Supabase (PostgreSQL + REST API) |
| Hardware | ESP32, LCD I2C 20x4, servo MG996R, stepper NEMA 17, 6 relay pump |
| Deployment | Vercel (serverless), Vite preview |

---

## Setup & Instalasi

### 1. Install Dependencies

```bash
# Root (frontend)
npm install

# Backend
cd server
npm install
cd ..
```

### 2. Environment Variables (`.env`)

Buat file `.env` di **Root Folder** dan di dalam folder **`server/`**.

**Root `.env`**:
```env
# Groq AI API Key (Dapatkan dari https://console.groq.com/keys)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Groq Model Name (Pilihan: groq/compound-mini, llama-3.1-8b-instant, qwen/qwen3.6-27b)
GROQ_MODEL=groq/compound-mini

# Express Server Port
PORT=5175

# Supabase Credentials (Dapatkan dari Supabase Dashboard > Project Settings > API)
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_KEY=your_supabase_anon_key_here
```

**`server/.env`**:
```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=groq/compound-mini
PORT=5175
```

### 3. Supabase Database Setup

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan pilih project Anda.
2. Buka tab **SQL Editor**.
3. Jalankan seluruh isi script [`supabase_schema.sql`](./supabase_schema.sql).

Tabel yang akan dibuat:
- **`robot_state`** — Single row (`id=1`) untuk mengontrol status & takaran robot real-time.
- **`orders`** — Menyimpan riwayat keluhan, kode verifikasi, dan takaran AI dari setiap pesanan.

### 4. Cara Menjalankan Aplikasi

Wajib jalankan **Backend Express** terlebih dahulu sebelum frontend React:

```bash
# Terminal 1 — Backend Express AI (port 5175)
node server/index.js

# Terminal 2 — Frontend React Vite (port 5173)
npm run dev
```

> **Catatan:** Vite sudah mengonfigurasi proxy `/api/*` ke `http://localhost:5175`. Jika `node server/index.js` tidak dijalankan, Anda akan mendapatkan error `ECONNREFUSED` / `500 Internal Server Error`.

---

## Alur Pesanan

```
1. User klik Generate     → Website buat kode 6-digit → Tampil di LCD ESP32
2. User input kode        → Website verifikasi ke Supabase (code_verified: true)
3. User tulis keluhan     → Website kirim ke Backend AI (Groq) → Dapat takaran {a,b,c,d,e,f}
4. Website simpan data    → Insert ke tabel `orders` & Update `robot_state`
5. ESP32 deteksi order    → Mulai proses pembuatan jamu fisik
6. ESP32 update progress  → "Mengambil Bahan Jamu" → "Mengaduk Jamu" → "Selesai"
7. Website polling        → Tampilkan progress bar → Popup selesai & resep jamu
8. ESP32 reset            → Status "robot siap" → Siap untuk pesanan berikutnya
```

---

## Troubleshooting & Problem Solving

- **`http proxy error: /api/jamu-dose ECONNREFUSED`**:
  Server backend Express belum dinyalakan. Jalankan `node server/index.js` di terminal terpisah.

- **`404 model_not_found` dari Groq API**:
  Pastikan `GROQ_API_KEY` di `.env` sudah diisi dengan API Key yang valid dari Groq Console. Jika model tertentu tidak tersedia di akun Anda, ubah `GROQ_MODEL=groq/compound-mini` di file `.env`.

- **Data keluhan tidak tersimpan di Supabase**:
  1. Pastikan AI Groq sukses mengembalikan takaran (data tidak tersimpan jika AI error).
  2. Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_KEY` di `.env` sudah diisi dengan data asli dari Supabase Dashboard.
  3. Pastikan `supabase_schema.sql` sudah di-run di SQL Editor Supabase.

---

## Tabel `robot_state` (Supabase)

| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `id` | `integer` | `1` | Single row (CHECK id=1) |
| `code` | `text` | `''` | Kode verifikasi 6-digit |
| `code_verified` | `boolean` | `false` | Status verifikasi user |
| `aidose` | `jsonb` | `[]` | Takaran AI: `[kunyit, jahe, temu, asam, gula, beras]` |
| `progress` | `text` | `'robot siap'` | Status robot (dibaca ESP32 & website) |
| `ready` | `boolean` | `true` | Robot siap terima pesanan |
| `order` | `text` | `'0'` | Counter global pesanan |
| `created_at` | `timestamptz` | `now()` | Timestamp |

---

## ESP32 (Hardware)

File: [`esp.ino`](./esp.ino) — Kode Arduino untuk ESP32.

**Fitur:**
- Koneksi WiFi + polling Supabase REST API
- LCD 20x4 I2C (alamat `0x27`)
- 6 relay pump untuk bahan jamu
- 2 servo dispenser gelas (PCA9685, alamat `0x40`)
- 1 servo holding + 1 servo dinamo pengaduk
- Stepper NEMA 17 untuk konveyor gelas

---

## Struktur Folder

```
HERBBOT-master/
├── index.html              # Entry Vite SPA
├── vite.config.js          # Vite + proxy /api → :5175
├── tailwind.config.js
├── supabase_schema.sql     # SQL schema Supabase
├── esp.ino                 # Kode ESP32 (Arduino)
├── .env                    # Root environment variables
├── .env.example            # Template env
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles.css
│   ├── lib/
│   │   ├── supabase.js     # Supabase client
│   │   └── prompt.js       # Prompt builder untuk Groq AI
│   ├── pages/
│   │   ├── Home.jsx        # Landing page
│   │   └── Pesanan.jsx     # Flow pesanan lengkap & Supabase sync
│   └── components/
│       ├── Modal.jsx
│       ├── ProgressBar.jsx
│       └── Footer.jsx
│
├── server/
│   ├── .env                # Backend environment variables
│   ├── package.json
│   └── index.js            # Express backend /api/jamu-dose
│
└── api/
    └── jamu-dose.js        # Vercel serverless function (production)
```
