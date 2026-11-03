#!/usr/bin/env python3
"""
PACUL - Starter Dataset Generator (untuk Verifikasi & Tes Training Kilat)
Membuat dataset contoh (30 gambar train & 10 gambar val) ber-bounding box
untuk memverifikasi bahwa pipeline training YOLO di RTX 3050 berjalan 100% mulus.
"""

import cv2
import numpy as np
from pathlib import Path

CLASSES = {
    0: ("botol_plastik", (255, 120, 0)),     # Biru / Cyan
    1: ("kardus", (42, 100, 165)),           # Cokelat Kardus
    2: ("jelantah", (0, 165, 255)),          # Kuning Gelap/Minyak
    3: ("organik", (50, 180, 50)),           # Hijau Daun/Organik
    4: ("kertas", (200, 200, 200))           # Putih Abu-abu
}

def generate_sample_dataset():
    base_dir = Path(__file__).resolve().parent.parent
    dataset_dir = base_dir / "datasets" / "waste_detection"

    for split in ["train", "val"]:
        (dataset_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (dataset_dir / "labels" / split).mkdir(parents=True, exist_ok=True)

    print("[INFO] Membuat starter sample dataset untuk pengujian pipeline...")

    splits = {"train": 30, "val": 10}

    for split, num_images in splits.items():
        for i in range(num_images):
            # Kanvas 640x640 latar belakang realistis (lantai/ubin/rumput)
            bg_color = np.random.randint(40, 120, size=3, dtype=np.uint8)
            img = np.full((640, 640, 3), bg_color, dtype=np.uint8)

            # Tambahkan sedikit noise tekstur
            noise = np.random.randint(0, 30, (640, 640, 3), dtype=np.uint8)
            img = cv2.add(img, noise)

            labels = []
            # Taruh 1 - 3 objek per gambar
            num_objects = np.random.randint(1, 4)
            for _ in range(num_objects):
                cls_id = np.random.randint(0, 5)
                cls_name, color = CLASSES[cls_id]

                # Random bounding box
                w = np.random.randint(80, 220)
                h = np.random.randint(80, 260)
                x = np.random.randint(20, 640 - w - 20)
                y = np.random.randint(20, 640 - h - 20)

                # Gambar representasi objek
                cv2.rectangle(img, (x, y), (x + w, y + h), color, -1)
                cv2.rectangle(img, (x, y), (x + w, y + h), (255, 255, 255), 2)
                cv2.putText(img, cls_name, (x + 5, y + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

                # Format anotasi YOLO normalisasi: <cls> <x_center> <y_center> <w> <h>
                x_center = (x + w / 2) / 640.0
                y_center = (y + h / 2) / 640.0
                norm_w = w / 640.0
                norm_h = h / 640.0
                labels.append(f"{cls_id} {x_center:.6f} {y_center:.6f} {norm_w:.6f} {norm_h:.6f}")

            img_path = dataset_dir / "images" / split / f"sample_{split}_{i:03d}.jpg"
            lbl_path = dataset_dir / "labels" / split / f"sample_{split}_{i:03d}.txt"

            cv2.imwrite(str(img_path), img)
            with open(lbl_path, "w") as f:
                f.write("\n".join(labels) + "\n")

    print(f"[SUCCESS] Starter dataset siap di: {dataset_dir}")
    print(" - Train: 30 gambar")
    print(" - Val  : 10 gambar")

if __name__ == "__main__":
    generate_sample_dataset()
