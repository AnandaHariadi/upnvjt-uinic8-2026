#!/usr/bin/env python3
"""
PACUL - Automated Waste Dataset Downloader & Converter (HuggingFace to YOLO)
Mengunduh dataset 'keremberke/garbage-object-detection' (Ribuan gambar real sampah)
langsung dari Hugging Face tanpa perlu API key, lalu mengonversi anotasi COCO ke format YOLO.
"""

import os
import sys
import json
import zipfile
import io
import shutil
import urllib.request
from pathlib import Path

# Mapping dari kategori HuggingFace (COCO) ke 5 Kelas PACUL
CLASS_MAPPING = {
    "plastic": 0,        # botol_plastik
    "cardboard": 1,      # kardus
    # 2: jelantah (akan ditambahkan secara khusus)
    "biodegradable": 3,  # organik
    "paper": 4           # kertas
}

def download_and_extract(url: str, split_name: str, target_dir: Path, max_images: int = 1500):
    print(f"\n[DOWNLOAD] Mengunduh dataset split '{split_name}'...")
    print(f" URL: {url}")

    # Buat direktori tujuan
    img_dir = target_dir / "images" / split_name
    lbl_dir = target_dir / "labels" / split_name
    img_dir.mkdir(parents=True, exist_ok=True)
    lbl_dir.mkdir(parents=True, exist_ok=True)

    # Download file zip ke memory stream
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )

    with urllib.request.urlopen(req) as response:
        total_size = int(response.headers.get("Content-Length", 0))
        downloaded = 0
        chunk_size = 1024 * 1024  # 1 MB
        buffer = io.BytesIO()

        while True:
            chunk = response.read(chunk_size)
            if not chunk:
                break
            buffer.write(chunk)
            downloaded += len(chunk)
            mb_down = downloaded / (1024 * 1024)
            mb_total = total_size / (1024 * 1024)
            print(f"\r Progress: {mb_down:.1f} MB / {mb_total:.1f} MB ({downloaded*100/total_size:.1f}%)", end="")
        print()

    print("[PROCESSING] Membaca file ZIP dan anotasi COCO...")
    buffer.seek(0)
    with zipfile.ZipFile(buffer) as z:
        if "_annotations.coco.json" not in z.namelist():
            print(f"[ERROR] '_annotations.coco.json' tidak ditemukan di {split_name}.zip")
            return 0

        coco_data = json.loads(z.read("_annotations.coco.json"))

        # Buat pemetaan ID kategori COCO ke ID kelas PACUL
        cat_id_to_pacul = {}
        for cat in coco_data.get("categories", []):
            name = cat["name"].lower()
            if name in CLASS_MAPPING:
                cat_id_to_pacul[cat["id"]] = CLASS_MAPPING[name]

        # Index anotasi per image_id
        annotations_by_img = {}
        for ann in coco_data.get("annotations", []):
            cid = ann["category_id"]
            if cid in cat_id_to_pacul:
                img_id = ann["image_id"]
                annotations_by_img.setdefault(img_id, []).append({
                    "pacul_class": cat_id_to_pacul[cid],
                    "bbox": ann["bbox"] # [x_min, y_min, width, height]
                })

        # Simpan gambar dan buat file label YOLO
        images = coco_data.get("images", [])
        converted_count = 0

        for img_info in images:
            if converted_count >= max_images:
                break

            img_id = img_info["id"]
            file_name = img_info["file_name"]
            img_w = img_info.get("width", 416)
            img_h = img_info.get("height", 416)

            # Hanya simpan jika gambar mengandung kelas yang kita inginkan
            if img_id not in annotations_by_img:
                continue

            anns = annotations_by_img[img_id]
            yolo_lines = []

            for ann in anns:
                p_cls = ann["pacul_class"]
                x_min, y_min, w, h = ann["bbox"]

                # Konversi COCO [x_min, y_min, w, h] ke YOLO [x_center, y_center, w, h] normalisasi
                x_center = (x_min + w / 2.0) / img_w
                y_center = (y_min + h / 2.0) / img_h
                norm_w = w / img_w
                norm_h = h / img_h

                # Clamp 0.0 - 1.0
                x_center = max(0.0, min(1.0, x_center))
                y_center = max(0.0, min(1.0, y_center))
                norm_w = max(0.0, min(1.0, norm_w))
                norm_h = max(0.0, min(1.0, norm_h))

                if norm_w > 0.01 and norm_h > 0.01:
                    yolo_lines.append(f"{p_cls} {x_center:.6f} {y_center:.6f} {norm_w:.6f} {norm_h:.6f}")

            if not yolo_lines:
                continue

            # Ekstrak gambar dari zip
            try:
                img_bytes = z.read(file_name)
                dest_img_path = img_dir / file_name
                with open(dest_img_path, "wb") as f_img:
                    f_img.write(img_bytes)

                # Tulis file anotasi YOLO (.txt)
                txt_name = Path(file_name).stem + ".txt"
                dest_lbl_path = lbl_dir / txt_name
                with open(dest_lbl_path, "w") as f_lbl:
                    f_lbl.write("\n".join(yolo_lines) + "\n")

                converted_count += 1
            except KeyError:
                continue

        print(f"[SUCCESS] Berhasil memproses {converted_count} gambar untuk split '{split_name}'!")
        return converted_count

def add_jelantah_samples(target_dir: Path):
    """Menambahkan sample anotasi kelas jelantah (Class 2) agar dataset lengkap 5 kelas."""
    import cv2
    import numpy as np

    print("\n[JELANTAH] Menambahkan sample starter kelas Jelantah (Class 2)...")
    splits = {"train": 40, "val": 10}

    for split, count in splits.items():
        img_dir = target_dir / "images" / split
        lbl_dir = target_dir / "labels" / split
        img_dir.mkdir(parents=True, exist_ok=True)
        lbl_dir.mkdir(parents=True, exist_ok=True)

        for i in range(count):
            # Background realistis ubin dapur / meja
            bg = np.random.randint(60, 140, size=(416, 416, 3), dtype=np.uint8)
            # Gambar representasi botol/jeriken minyak jelantah (warna kuning kecokelatan)
            x, y = np.random.randint(50, 180), np.random.randint(50, 150)
            w, h = np.random.randint(100, 160), np.random.randint(140, 220)

            # Botol/wadah
            cv2.rectangle(bg, (x, y), (x + w, y + h), (0, 140, 220), -1)  # Warna jelantah pekat
            cv2.rectangle(bg, (x, y), (x + w, y + h), (255, 255, 255), 2)
            cv2.putText(bg, "JELANTAH", (x + 10, y + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            fname = f"jelantah_sample_{split}_{i:03d}.jpg"
            cv2.imwrite(str(img_dir / fname), bg)

            # YOLO annotation (Class 2)
            xc = (x + w / 2.0) / 416.0
            yc = (y + h / 2.0) / 416.0
            nw = w / 416.0
            nh = h / 416.0
            with open(lbl_dir / f"jelantah_sample_{split}_{i:03d}.txt", "w") as f:
                f.write(f"2 {xc:.6f} {yc:.6f} {nw:.6f} {nh:.6f}\n")

    print("[SUCCESS] 50 sample kelas Jelantah berhasil ditambahkan ke train & val!")

def main():
    base_dir = Path(__file__).resolve().parent.parent
    target_dir = base_dir / "datasets" / "waste_detection"

    print("=" * 65)
    print(" PACUL AI: PENGUNDUH DATASET RESMI HUGGING FACE (NO API KEY)")
    print("=" * 65)

    # 1. Unduh valid.zip (36.5 MB, ~2.000 gambar asli) -> dijadikan validation set
    valid_url = "https://huggingface.co/datasets/keremberke/garbage-object-detection/resolve/main/data/valid.zip"
    val_count = download_and_extract(valid_url, "val", target_dir, max_images=300)

    # 2. Unduh train.zip (131 MB, ~7.000 gambar asli) -> dijadikan training set
    train_url = "https://huggingface.co/datasets/keremberke/garbage-object-detection/resolve/main/data/train.zip"
    train_count = download_and_extract(train_url, "train", target_dir, max_images=1200)

    # 3. Tambahkan starter data untuk Jelantah (Class 2)
    add_jelantah_samples(target_dir)

    print("\n" + "=" * 65)
    print(" RINGKASAN DATASET SIAP LATIH:")
    print(f" - Folder: {target_dir}")
    print(f" - Total Gambar Training  : {train_count + 40}")
    print(f" - Total Gambar Validasi  : {val_count + 10}")
    print(" - 5 Kelas Terpetakan:")
    print("     0: botol_plastik")
    print("     1: kardus")
    print("     2: jelantah")
    print("     3: organik")
    print("     4: kertas")
    print("=" * 65)

if __name__ == "__main__":
    main()
