#!/usr/bin/env python3
"""
PACUL - Auto Dataset Downloader from Roboflow Universe
Mengunduh dataset 'garbage-classification-3' (10k+ anotasi sampah)
dan secara otomatis memetakan labelnya ke format 5 kelas PACUL:
  0: botol_plastik
  1: kardus
  2: jelantah (disiapkan slot khusus untuk foto lokal)
  3: organik
  4: kertas
"""

import os
import sys
import shutil
from pathlib import Path
import argparse

def setup_roboflow_dataset(api_key: str):
    try:
        from roboflow import Roboflow
    except ImportError:
        print("[ERROR] Modul roboflow belum terpasang. Jalankan: pip install roboflow")
        sys.exit(1)

    base_dir = Path(__file__).resolve().parent.parent
    target_dir = base_dir / "datasets" / "waste_detection"
    temp_download = base_dir / "datasets" / "temp_roboflow"

    print("=" * 65)
    print(" PACUL: Mengunduh Dataset dari Roboflow Universe")
    print("=" * 65)

    rf = Roboflow(api_key=api_key)
    print("[1/4] Mengakses project 'garbage-classification-3'...")
    try:
        project = rf.workspace("material-identification").project("garbage-classification-3")
        version = project.version(1)
        print("[2/4] Mengunduh dataset format YOLOv8...")
        dataset = version.download("yolov8", location=str(temp_download))
    except Exception as e:
        print(f"[ERROR] Gagal mengunduh: {e}")
        print("Pastikan API Key Roboflow valid (Bisa didapat gratis di https://app.roboflow.com)")
        return False

    print("[3/4] Memetakan kelas dataset ke 5 Kelas PACUL...")
    # Original classes di Garbage Classification 3:
    # 0: biodegradable -> PACUL class 3 (organik)
    # 1: cardboard     -> PACUL class 1 (kardus)
    # 2: glass         -> diabaikan atau dimasukkan residu
    # 3: metal         -> diabaikan atau dimasukkan residu
    # 4: paper         -> PACUL class 4 (kertas)
    # 5: plastic       -> PACUL class 0 (botol_plastik)
    class_remap = {
        0: 3,  # biodegradable -> organik
        1: 1,  # cardboard -> kardus
        4: 4,  # paper -> kertas
        5: 0   # plastic -> botol_plastik
    }

    # Buat direktori target
    for split in ["train", "val", "test"]:
        (target_dir / "images" / split).mkdir(parents=True, exist_ok=True)
        (target_dir / "labels" / split).mkdir(parents=True, exist_ok=True)

    def process_split(split_name, src_folder):
        img_src = temp_download / src_folder / "images"
        lbl_src = temp_download / src_folder / "labels"
        if not img_src.exists():
            return

        dest_img = target_dir / "images" / split_name
        dest_lbl = target_dir / "labels" / split_name

        count = 0
        for lbl_file in lbl_src.glob("*.txt"):
            valid_lines = []
            with open(lbl_file, "r") as f:
                for line in f:
                    parts = line.strip().split()
                    if not parts:
                        continue
                    old_cls = int(parts[0])
                    if old_cls in class_remap:
                        new_cls = class_remap[old_cls]
                        valid_lines.append(f"{new_cls} " + " ".join(parts[1:]))

            # Jika ada label yang cocok, simpan
            if valid_lines:
                with open(dest_lbl / lbl_file.name, "w") as f:
                    f.write("\n".join(valid_lines) + "\n")

                # Salin gambar yang bersangkutan
                for ext in [".jpg", ".png", ".jpeg", ".JPG"]:
                    matching_img = img_src / f"{lbl_file.stem}{ext}"
                    if matching_img.exists():
                        shutil.copy2(matching_img, dest_img / matching_img.name)
                        count += 1
                        break

        print(f" -> Berhasil memetakan {count} gambar untuk split '{split_name}'.")

    process_split("train", "train")
    process_split("val", "valid")

    print("[4/4] Membersihkan folder unduhan sementara...")
    shutil.rmtree(temp_download, ignore_errors=True)

    print("\n" + "=" * 65)
    print(" SUKSES: Dataset 4 Kelas Siap Digunakan!")
    print(f" Lokasi: {target_dir}")
    print(" Langkah selanjutnya: Tambahkan 30-50 foto botol jelantah khas lokal ke kelas 2 (jelantah).")
    print("=" * 65)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download & Remap Garbage Classification Dataset")
    parser.add_argument("--api-key", type=str, required=True, help="Roboflow Free API Key")
    args = parser.parse_args()

    setup_roboflow_dataset(args.api_key)
