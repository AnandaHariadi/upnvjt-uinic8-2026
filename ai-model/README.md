# PACUL AI Engine: Waste Object Detection & Hierarchical Classification

Modul kecerdasan buatan untuk **PACUL (Platform Aksi Komunitas Untuk Lingkungan)**.
Menggunakan arsitektur 2-tahap:
1. **Object Detection (Ultralytics YOLOv11n / YOLOv8n)**: Mendeteksi posisi bounding box objek sampah secara presisi.
2. **Kategori & Integrasi PACUL**: Mengelompokkan hasil bounding box ke dalam kategori besar sampah (*Anorganik Daur Ulang*, *Organik*, *Limbah Rumah Tangga Khusus Jelantah*) serta menghitung estimasi **EcoPoints** untuk warga.

---

## 🎯 5 Kelas Target Deteksi

| ID | Label | Kategori Makro PACUL | Aksi Hijau | Estimasi Poin |
|---|---|---|---|---|
| `0` | `botol_plastik` | Anorganik (Plastik Daur Ulang) | `waste_sorting` | +50 EcoPoints |
| `1` | `kardus` | Anorganik (Kertas/Kardus Daur Ulang) | `waste_sorting` | +45 EcoPoints |
| `2` | `jelantah` | Limbah Khusus (Minyak Jelantah / UCO) | `used_cooking_oil` | +80 EcoPoints |
| `3` | `organik` | Sampah Organik (Sisa Makanan/Kompos) | `waste_sorting` | +60 EcoPoints |
| `4` | `kertas` | Anorganik (Kertas Daur Ulang) | `waste_sorting` | +40 EcoPoints |

---

## 💻 Evaluasi Hardware: Apakah GPU Lokal Ngangkat?

Berdasarkan inspeksi hardware laptop Anda:
- **GPU**: NVIDIA GeForce RTX 3050 Laptop GPU (**4 GB VRAM**, Tensor Cores Ampere)
- **CPU**: Intel Core i5-12500H (12 Cores, 16 Threads)
- **RAM**: 24 GB RAM

### 🟢 Kesimpulan: **SANGAT NGANGKAT & OPTIMAL!**
- **YOLOv11n (Nano)** atau **YOLOv8n / YOLOv8s** dirancang sangat efisien.
- Dengan parameter `imgsz=640`, `batch=16`, dan `amp=True` (FP16 Mixed Precision), konsumsi VRAM hanya berkisar **1.8 GB – 2.4 GB** (jauh di bawah limit 4 GB).
- Estimasi waktu training: **15 – 30 menit** untuk 50 epoch pada dataset 1.000 – 2.000 gambar.
- **Kelebihan training lokal**: Bebas kuota internet, tidak ada limit waktu sesi (seperti disconnect Colab), dan langsung tersimpan di proyek.

*(Opsional: Google Colab gratis GPU T4 16GB bisa dijadikan cadangan jika laptop sedang digunakan untuk multitasking berat atau rendering video).*

---

## 🚀 Panduan Menjalankan Training di Lokal

### 1. Instalasi Driver & PyTorch CUDA
Jalankan di terminal PowerShell (pastikan di folder `pacul lomba/ai-model`):

```bash
# 1. Install PyTorch dengan dukungan CUDA 12.4
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124

# 2. Install dependensi modul AI
pip install -r requirements.txt
```

### 2. Siapkan Dataset
Jalankan panduan struktur folder:
```bash
python scripts/1_download_dataset.py
```
Letakkan foto dan anotasi YOLO di folder `datasets/waste_detection/`.

### 3. Mulai Training YOLO
```bash
# Training dengan YOLOv11n (default 50 epochs, batch 16 di GPU 0)
python scripts/2_train_yolo.py --epochs 50 --batch 16
```

### 4. Tes Deteksi & Visualisasi Bounding Box
```bash
python scripts/3_eval_and_predict.py --source "path/ke/foto_sampah.jpg"
```

### 5. Ekspor Model (ONNX / WebGL untuk PACUL Next.js)
```bash
python scripts/4_export_model.py --format onnx
```

### 6. Pipeline Klasifikasi & Integrasi Poin PACUL
```bash
python scripts/5_classify_waste.py --image "path/ke/foto_sampah.jpg"
```
Output berupa format JSON lengkap dengan status verifikasi PACUL, bounding box, dan perolehan EcoPoints.
