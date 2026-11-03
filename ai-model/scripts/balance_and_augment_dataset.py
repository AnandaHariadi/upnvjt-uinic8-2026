#!/usr/bin/env python3
"""
PACUL - Dataset Optimizer & Augmenter
1. Membersihkan clutter micro-boxes pada sampah organik (mencegah bias)
2. Menyeimbangkan split train & val untuk kertas dan botol plastik
3. Melakukan augmentasi cerdas (rotasi, pencahayaan, flip) untuk kelas minoritas
"""

import cv2
import numpy as np
import random
from pathlib import Path
import shutil

CLASS_NAMES = {
    0: "botol_plastik",
    1: "kardus",
    2: "jelantah",
    3: "organik",
    4: "kertas"
}

def clean_and_balance_dataset():
    base_dir = Path(__file__).resolve().parent.parent
    dataset_dir = base_dir / "datasets" / "waste_detection"
    
    print("=" * 65)
    print(" PACUL: Mengoptimasi & Menyeimbangkan Distribusi Dataset")
    print("=" * 65)

    # 1. Bersihkan micro-boxes yang terlalu kecil (< 2% ukuran gambar) dan batasi organik maks 6 per gambar
    cleaned_count = 0
    for split in ["train", "val"]:
        lbl_dir = dataset_dir / "labels" / split
        for lbl_path in lbl_dir.glob("*.txt"):
            lines = lbl_path.read_text().splitlines()
            new_lines = []
            organic_count = 0
            for line in lines:
                parts = line.strip().split()
                if not parts:
                    continue
                cls_id = int(parts[0])
                w = float(parts[3])
                h = float(parts[4])

                # Filter noise micro-boxes
                if w < 0.025 or h < 0.025:
                    continue

                # Batasi kotak organik per gambar agar tidak mendominasi loss
                if cls_id == 3:
                    if organic_count >= 6:
                        continue
                    organic_count += 1

                new_lines.append(line.strip())

            if len(new_lines) != len(lines):
                lbl_path.write_text("\n".join(new_lines) + "\n")
                cleaned_count += 1

    print(f"[STEP 1] Berhasil merapikan {cleaned_count} file label dari micro-boxes.")

    # 2. Pindahkan sebagian data kertas dan botol dari train ke val agar evaluasi validasi akurat
    train_lbl_dir = dataset_dir / "labels" / "train"
    train_img_dir = dataset_dir / "images" / "train"
    val_lbl_dir = dataset_dir / "labels" / "val"
    val_img_dir = dataset_dir / "images" / "val"

    rebalanced = 0
    for lbl_path in list(train_lbl_dir.glob("*.txt")):
        lines = lbl_path.read_text().splitlines()
        has_paper = any(l.startswith("4 ") for l in lines)
        has_bottle = any(l.startswith("0 ") for l in lines)
        
        # Pindahkan sebagian kecil ke validation
        if (has_paper or has_bottle) and random.random() < 0.15:
            stem = lbl_path.stem
            # Cari gambar pasangan
            for ext in [".jpg", ".png", ".jpeg", ".JPG"]:
                img_path = train_img_dir / f"{stem}{ext}"
                if img_path.exists():
                    shutil.move(str(img_path), str(val_img_dir / img_path.name))
                    shutil.move(str(lbl_path), str(val_lbl_dir / lbl_path.name))
                    rebalanced += 1
                    break

    print(f"[STEP 2] Memindahkan {rebalanced} gambar berkelas kertas/botol ke validation set.")

    # 3. Data Augmentation untuk kelas Kertas, Botol Plastik, dan Jelantah di Train Set
    print("[STEP 3] Menjalankan Augmentasi Data untuk Kertas, Botol, dan Jelantah...")
    augmented_count = 0

    for lbl_path in list(train_lbl_dir.glob("*.txt")):
        if "_aug" in lbl_path.stem:
            continue
            
        lines = lbl_path.read_text().splitlines()
        needs_aug = any(l.startswith(("0 ", "2 ", "4 ")) for l in lines)
        if not needs_aug:
            continue

        stem = lbl_path.stem
        img_path = None
        for ext in [".jpg", ".png", ".jpeg", ".JPG"]:
            cand = train_img_dir / f"{stem}{ext}"
            if cand.exists():
                img_path = cand
                break

        if not img_path:
            continue

        img = cv2.imread(str(img_path))
        if img is None:
            continue

        # Augmentasi 1: Horizontal Flip
        img_flipped = cv2.flip(img, 1)
        flipped_lines = []
        for line in lines:
            parts = line.split()
            cls_id = parts[0]
            xc, yc, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
            xc_flip = 1.0 - xc
            flipped_lines.append(f"{cls_id} {xc_flip:.6f} {yc:.6f} {w:.6f} {h:.6f}")

        aug_name = f"{stem}_aug_flip"
        cv2.imwrite(str(train_img_dir / f"{aug_name}.jpg"), img_flipped)
        (train_lbl_dir / f"{aug_name}.txt").write_text("\n".join(flipped_lines) + "\n")
        augmented_count += 1

        # Augmentasi 2: Variasi Kecerahan & Kontras (Indoor vs Outdoor)
        alpha = random.uniform(0.8, 1.25) # Kontras
        beta = random.randint(-25, 25)    # Kecerahan
        img_bc = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
        aug_name_bc = f"{stem}_aug_bc"
        cv2.imwrite(str(train_img_dir / f"{aug_name_bc}.jpg"), img_bc)
        (train_lbl_dir / f"{aug_name_bc}.txt").write_text("\n".join(lines) + "\n")
        augmented_count += 1

    print(f"[SUCCESS] Berhasil menghasilkan {augmented_count} gambar augmentasi baru!")
    print("=" * 65)

if __name__ == "__main__":
    clean_and_balance_dataset()
