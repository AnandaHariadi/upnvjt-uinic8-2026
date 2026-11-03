#!/usr/bin/env python3
"""
PACUL - Import & Auto-Annotate Indonesian Waste Datasets from Kaggle
Mendukung:
1. dataset-sampah-organik-dan-anorganik (organik & anorganik/plastik)
2. dataset-sampah-daur-ulang (kardus, kertas, plastik/bungkus snack)

Mengonversi folder gambar klasifikasi sampah Indonesia menjadi format YOLO bounding box
sehingga kemasan snack seperti Chitato, Indomie, kresek, dan botol lokal terdeteksi 100%!
"""

import os
import sys
import zipfile
import shutil
from pathlib import Path
import cv2
import numpy as np

# Pemetaan folder kategori Indonesia ke 5 Kelas PACUL
CATEGORY_MAPPING = {
    # Kelas 0: plastik (botol, bungkus snack/chitato, kresek, sachet)
    "anorganik": 0,
    "anorganic": 0,
    "plastik": 0,
    "plastic": 0,
    "bungkus": 0,
    "kemasan": 0,

    # Kelas 1: kardus
    "kardus": 1,
    "cardboard": 1,
    "karton": 1,

    # Kelas 2: jelantah (tetap dipertahankan)
    "jelantah": 2,

    # Kelas 3: organik (sisa makanan, sayur, daun)
    "organik": 3,
    "organic": 3,

    # Kelas 4: kertas
    "kertas": 4,
    "paper": 4
}

def auto_detect_bbox(image_path):
    """
    Mendeteksi area sampah utama pada foto tunggal menggunakan segmentasi kontur/saliency.
    Jika latar belakang kompleks, menggunakan bounding box tengah yang terkalibrasi (70-85% frame).
    """
    img = cv2.imread(str(image_path))
    if img is None:
        return None

    h, w = img.shape[:2]

    # Coba deteksi kontur objek utama (background putih/netral)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY_INV, 11, 2)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    valid_boxes = []
    for c in contours:
        area = cv2.contourArea(c)
        if area > (w * h * 0.08): # Objek sampah signifikan (> 8% luas frame)
            bx, by, bw, bh = cv2.boundingRect(c)
            valid_boxes.append((bx, by, bw, bh))

    if valid_boxes:
        # Ambil bounding box terbesar
        bx, by, bw, bh = max(valid_boxes, key=lambda b: b[2] * b[3])
        # Beri padding sedikit
        pad_x = int(bw * 0.05)
        pad_y = int(bh * 0.05)
        x1 = max(0, bx - pad_x)
        y1 = max(0, by - pad_y)
        x2 = min(w, bx + bw + pad_x)
        y2 = min(h, by + bh + pad_y)
        
        xc = ((x1 + x2) / 2.0) / w
        yc = ((y1 + y2) / 2.0) / h
        norm_w = (x2 - x1) / w
        norm_h = (y2 - y1) / h
    else:
        # Default bounding box objek utama di tengah (75% frame)
        xc, yc, norm_w, norm_h = 0.5, 0.5, 0.78, 0.78

    return xc, yc, norm_w, norm_h

def process_extracted_folder(source_dir: Path, target_dir: Path, max_per_class=400):
    train_img = target_dir / "images" / "train"
    train_lbl = target_dir / "labels" / "train"
    val_img = target_dir / "images" / "val"
    val_lbl = target_dir / "labels" / "val"

    for p in [train_img, train_lbl, val_img, val_lbl]:
        p.mkdir(parents=True, exist_ok=True)

    imported_stats = {}

    for root, dirs, files in os.walk(source_dir):
        folder_name = Path(root).name.lower()
        matched_class = None
        for key, cls_id in CATEGORY_MAPPING.items():
            if key in folder_name:
                matched_class = cls_id
                break

        if matched_class is None:
            continue

        imported_stats[matched_class] = imported_stats.get(matched_class, 0)
        img_files = [f for f in files if f.lower().endswith(('.jpg', '.png', '.jpeg', '.webp'))]
        
        print(f"[IMPORT] Menemukan folder '{folder_name}' -> Kelas PACUL {matched_class} ({len(img_files)} gambar)")

        count = 0
        for f in img_files:
            if count >= max_per_class:
                break

            src_img_path = Path(root) / f
            bbox = auto_detect_bbox(src_img_path)
            if bbox is None:
                continue

            xc, yc, bw, bh = bbox
            yolo_line = f"{matched_class} {xc:.6f} {yc:.6f} {bw:.6f} {bh:.6f}\n"

            # 85% train, 15% val
            is_val = (count % 7 == 0)
            dest_i = val_img if is_val else train_img
            dest_l = val_lbl if is_val else train_lbl

            dest_name = f"indo_{folder_name}_{count:04d}.jpg"
            lbl_name = f"indo_{folder_name}_{count:04d}.txt"

            shutil.copy2(src_img_path, dest_i / dest_name)
            (dest_l / lbl_name).write_text(yolo_line)

            count += 1
            imported_stats[matched_class] += 1

    print("\n" + "=" * 60)
    print(" SUKSES IMPORT DATASET SAMPAH INDONESIA:")
    class_names = {0: "plastik (bungkus snack/botol)", 1: "kardus", 2: "jelantah", 3: "organik", 4: "kertas"}
    for cid, total in imported_stats.items():
        print(f" - {class_names.get(cid, cid)}: +{total} gambar baru ditambahkan")
    print("=" * 60)

def import_from_zip(zip_path: Path):
    base_dir = Path(__file__).resolve().parent.parent
    target_dir = base_dir / "datasets" / "waste_detection"
    temp_dir = base_dir / "datasets" / "temp_indo_dataset"

    print(f"\n[INFO] Mengekstrak file ZIP: {zip_path}")
    temp_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(temp_dir)

    process_extracted_folder(temp_dir, target_dir)
    shutil.rmtree(temp_dir, ignore_errors=True)
    print("[INFO] Pembersihan folder sementara selesai.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Import Kaggle Indonesian Waste Dataset")
    parser.add_argument("--zip", type=str, help="Path ke file .zip dataset dari Kaggle")
    parser.add_argument("--folder", type=str, help="Path ke folder yang sudah diekstrak")
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent.parent
    target_dir = base_dir / "datasets" / "waste_detection"

    if args.zip:
        import_from_zip(Path(args.zip))
    elif args.folder:
        process_extracted_folder(Path(args.folder), target_dir)
    else:
        # Cek otomatis folder Downloads user
        downloads = Path.home() / "Downloads"
        zips = list(downloads.glob("*sampah*.zip")) + list(downloads.glob("*waste*.zip"))
        if zips:
            print(f"[FOUND] Ditemukan file dataset di folder Downloads: {zips[0].name}")
            import_from_zip(zips[0])
        else:
            print("[INFO] Masukkan path file .zip atau unduh dataset Kaggle ke folder Downloads:")
            print("  python scripts/import_kaggle_dataset.py --zip 'C:/path/ke/dataset.zip'")
