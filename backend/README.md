# Backend Architecture & API Specifications — PACUL

Dokumen ini memuat dokumentasi arsitektur **lapisan backend & Route Handlers** pada aplikasi PACUL.

---

## 1. Arsitektur Route Handlers (Server-Side)

Seluruh logika backend berjalan di atas runtime Node.js Next.js 14 melalui App Router Route Handlers di direktori `src/app/api/`.

```
src/
├── app/api/
│   ├── eco-action/
│   │   └── verify/
│   │       └── route.ts         # GET (mode status) & POST (verifikasi foto AI)
│   └── ocr/
│       └── scan-bill/
│           └── route.ts         # POST (ekstraksi data struk listrik PLN)
└── lib/
    ├── server/
    │   ├── google-vision.ts     # Integrasi Google Cloud Vision API ("server-only")
    │   ├── image-validation.ts  # Validasi magic bytes & resolusi gambar
    │   └── rate-limit.ts        # In-memory sliding window rate limiter
    └── verification/
        └── evaluate.ts          # Mesin penilaian heuristik & pencocokan label
```

---

## 2. Spesifikasi Endpoint API

### A. Status Verifikasi (`GET /api/eco-action/verify`)
- **Tujuan**: Memeriksa mode verifikasi aktif tanpa mengekspos kunci API atau rahasia server.
- **Header**: `Accept: application/json`
- **Response `200 OK`**:
  ```json
  {
    "mode": "live" | "demo",
    "available": true,
    "provider": "Google Cloud Vision (label detection) + PACUL rules"
  }
  ```

---

### B. Verifikasi Aksi Hijau (`POST /api/eco-action/verify`)
- **Tujuan**: Menganalisis bukti foto aksi hijau menggunakan Vision AI dan aturan mitigasi kecurangan.
- **Content-Type**: `multipart/form-data`
- **Payload Fields**:
  - `image` *(File, wajib)*: Foto bukti (JPEG, PNG, WebP; $\le 5$ MB; $\ge 320$ px).
  - `actionType` *(String, wajib)*: Salah satu dari `waste_sorting`, `used_cooking_oil`, `tree_planting`, `energy_saving`, `sustainable_transport`.
  - `capturedAt` *(String/Number, opsional)*: Timestamp saat foto diambil (ISO string atau epoch ms).

#### Respons Kode Status:
| Kode | Deskripsi |
|---|---|
| `200 OK` | Analisis selesai, mengembalikan `VerificationResponse`. |
| `400 Bad Request` | Form data tidak valid, jenis aksi tidak dikenal, atau gambar $< 320$ px. |
| `413 Payload Too Large` | Ukuran gambar melebihi batas 5 MB. |
| `415 Unsupported Media Type` | File bukan gambar valid berdasarkan pengecekan magic bytes header. |
| `429 Too Many Requests` | Melebihi batas kuota 10 request per menit per IP. |

#### Contoh Respon Berhasil (`200 OK`):
```json
{
  "status": "verified",
  "mode": "live",
  "provider": "Google Cloud Vision (label detection) + PACUL rules",
  "actionType": "waste_sorting",
  "imageHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "checkedAt": "2026-10-20T08:30:00.000Z",
  "modelConfidence": 0.88,
  "detectedLabels": [
    { "description": "Plastic bottle", "score": 0.94 },
    { "description": "Recycling bin", "score": 0.88 }
  ],
  "flags": [],
  "reason": "Clear evidence of waste sorting found."
}
```

---

### C. OCR Struk Listrik PLN (`POST /api/ocr/scan-bill`)
- **Tujuan**: Ekstraksi angka kWh dan tagihan listrik dari foto struk PLN untuk pelacak jejak karbon.
- **Content-Type**: `multipart/form-data`
- **Payload**: `image` *(File, maks 10 MB)*.
- **Algoritma Ekstraksi**:
  - Regex pencocokan nomor pelanggan (`10-13 digit`), daya VA, penggunaan kWh, dan nominal tagihan.
  - Parser angka desimal yang membedakan format pemisah ribuan Rupiah dan desimal pemakaian kWh.
- **Contoh Respon `200 OK`**:
  ```json
  {
    "success": true,
    "mode": "live",
    "kwh": 248.5,
    "tagihan": 412350,
    "confidence": 91,
    "raw_text": "PT PLN (Persero)\nNo. Pelanggan: 141234567890\n...",
    "data": {
      "no_pelanggan": "141234567890",
      "nama_pelanggan": "BUDI SANTOSO",
      "bulan_tagihan": "MEI 2026",
      "daya_va": "1.300 VA",
      "penggunaan_kwh": "248.5",
      "tagihan_rp": "412.350"
    }
  }
  ```

---

## 3. Konfigurasi Lingkungan Server (Environment Variables)

| Variabel | Tipe | Default | Keterangan |
|---|---|---|---|
| `GOOGLE_VISION_API_KEY` | String (Secret) | - | Kunci API Google Cloud Vision untuk deteksi label dan SafeSearch. |
| `AI_VERIFICATION_MODE` | String | `auto` | Pilihan: `auto` (gunakan AI jika ada key), `live` (wajib AI), `demo` (simulasi). |
| `NODE_ENV` | String | `development` | Lingkungan runtime Node.js. |
