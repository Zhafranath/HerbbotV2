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
| Backend AI | Express.js, Groq SDK (`llama-3.1-8b-instant`) |
| Database | Supabase (PostgreSQL + REST API) |
| Hardware | ESP32, LCD I2C 20x4, servo MG996R, stepper NEMA 17, 6 relay pump |
| Deployment | Vercel (serverless), Vite preview |

---

## Setup

### 1. Install dependencies

```bash
# Root (frontend)
npm install

# Backend
cd server
npm install
cd ..
```

### 2. Environment variables

**Root `.env`** (template):
```
GROQ_API_KEY=your_groq_api_key_here
PORT=5175
```

**`server/.env`** (wajib):
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5175
```

### 3. Supabase

Jalankan `supabase_schema.sql` di **SQL Editor Supabase**.

Tabel yang dibuat:
- **`robot_state`** — single row (`id=1`), status robot real-time
- **`orders`** — history tiap pesanan

### 4. Jalankan

```bash
# Terminal 1 — backend AI (port 5175)
node server/index.js

# Terminal 2 — frontend (port 5173)
npm run dev
```

> Vite sudah di-proxy: `/api/*` → `localhost:5175`

---

## Alur Pesanan

```
1. User klik Generate     → website buat kode 6-digit → tampil di LCD ESP32
2. User input kode        → website verifikasi ke Supabase
3. User tulis keluhan     → website kirim ke AI (Groq) → dapat takaran {a,b,c,d,e,f}
4. Website increment order → ESP32 deteksi order baru → mulai buat jamu
5. ESP32 update progress  → "Mengambil Bahan Jamu" → "Mengaduk Jamu" → "Selesai"
6. Website polling         → progress bar → popup selesai + resep
7. ESP32 reset             → "Robot Ready" → siap pesanan berikutnya
```

---

## Tabel `robot_state` (Supabase)

| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `id` | `integer` | `1` | Single row (CHECK id=1) |
| `code` | `text` | `''` | Kode verifikasi 6-digit |
| `code_verified` | `boolean` | `false` | User sudah verifikasi |
| `aidose` | `jsonb` | `[]` | Takaran AI: `[kunyit, jahe, temu, asam, gula, beras]` |
| `progress` | `text` | `robot siap` | Status robot (dibaca ESP32 & website) |
| `ready` | `boolean` | `true` | Robot siap terima pesanan |
| `order` | `text` | `'0'` | Counter global, bertambah 1 tiap order |
| `created_at` | `timestamptz` | `now()` | Timestamp |

---

## ESP32

File: `esp.ino` — kode Arduino untuk ESP32.

**Fitur:**
- Koneksi WiFi + polling Supabase REST API
- LCD 20x4 I2C (alamat `0x27`)
- 6 relay pump untuk bahan jamu
- 2 servo dispenser gelas (PCA9685, alamat `0x40`)
- 1 servo holding + 1 servo dinamo pengaduk
- Stepper NEMA 17 untuk konveyor gelas

**Pin mapping:**
| Komponen | Pin |
|---|---|
| Relay Kunyit | 32 |
| Relay Jahe | 25 |
| Relay Temulawak | 26 |
| Relay Asam Jawa | 27 |
| Relay Gula Aren | 14 |
| Relay Beras Kencur | 13 |
| Relay Dinamo | 19 |
| Servo Kanan | 12 (PCA9685) |
| Servo Kiri | 15 (PCA9685) |
| Servo Holding | 10 (PCA9685) |
| Servo Dinamo | 3 (PCA9685) |
| Step NEMA | 17 |
| Dir NEMA | 16 |

---

## Struktur Folder

```
HERBBOT-main/
├── index.html              # Entry Vite SPA
├── vite.config.js          # Vite + proxy /api → :5175
├── tailwind.config.js
├── supabase_schema.sql     # SQL schema Supabase
├── esp.ino                 # Kode ESP32 (Arduino)
├── .env                    # Template env
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
│   │   └── Pesanan.jsx     # Flow pesanan lengkap
│   └── components/
│       ├── Modal.jsx
│       ├── ProgressBar.jsx
│       └── Footer.jsx
│
├── server/
│   ├── .env                # GROQ_API_KEY + PORT (gitignored)
│   ├── package.json
│   └── index.js            # Express backend /api/jamu-dose
│
└── api/
    └── jamu-dose.js        # Vercel serverless (production)
```
