#!/usr/bin/env python3
"""
PACUL - Dataset Downloader & Preparation Guide
Membantu mengunduh atau menyusun dataset 5 kelas sampah:
1. botol_plastik
2. kardus
3. jelantah
4. organik
5. kertas
"""

import os
from pathlib import Path

def print_dataset_guide():
    base_dir = Path(__file__).resolve().parent.parent
    dataset_dir = base_dir / "datasets" / "waste_detection"
    
    print("=" * 65)
    print(" PACUL - PANDUAN PENYIAPAN DATASET OBJECT DETECTION")
    print("=" * 65)
    print("""
Struktur folder dataset yang dibutuhkan YOLO:
  ai-model/datasets/waste_detection/
    ├── images/
    │   ├── train/  (kumpulan file .jpg / .png)
    │   └── val/    (kumpulan file .jpg / .png)
    └── labels/
        ├── train/  (file .txt anotasi YOLO dengan format: <class_id> <x> <y> <w> <h>)
        └── val/    (file .txt anotasi YOLO)

Target 5 Kelas:
  0: botol_plastik
  1: kardus
  2: jelantah
  3: organik
  4: kertas

CARA MENDAPATKAN DATASET CEPAT:
1. Menggunakan Roboflow Universe (Paling Praktis & Sudah Ber-bounding box):
   - Kunjungi https://universe.roboflow.com/search?q=waste+detection
   - Atau https://universe.roboflow.com/search?q=garbage+classification
   - Pilih format ekspor: "YOLOv8"
   - Anda akan mendapatkan kode snippet python seperti:
     ```python
     from roboflow import Roboflow
     rf = Roboflow(api_key="API_KEY_ANDA")
     project = rf.workspace("...").project("...")
     version = project.version(1).download("yolov8")
     ```

2. Foto Sendiri (Lokal Surabaya / Sampah Nyata):
   - Gunakan tools anotasi gratis seperti:
     * Roboflow Annotate (Web gratis)
     * Labelme / CVAT
   - Anotasi 50-100 foto per kelas sudah sangat cukup untuk fine-tuning YOLOv11n!
""")
    print("=" * 65)

    # Buat direktori dasar jika belum ada
    for sub in ["images/train", "images/val", "labels/train", "labels/val"]:
        (dataset_dir / sub).mkdir(parents=True, exist_ok=True)
    print(f"[OK] Folder dataset siap di: {dataset_dir}")

if __name__ == "__main__":
    print_dataset_guide()
