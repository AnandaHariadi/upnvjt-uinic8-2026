#!/usr/bin/env python3
"""
PACUL - Quick Webcam Sample Collector & Auto-Annotator
Mengambil 30-50 foto cepat dari webcam untuk produk lokal (Cleo kecil, Chitato, Indomie, dll)
dan langsung membuatkan file label bounding box YOLO secara otomatis!

Cara Pakai:
  python scripts/capture_local_samples.py --name chitato --cls 0
  python scripts/capture_local_samples.py --name cleo_kecil --cls 0
"""

import sys
import time
from pathlib import Path
import cv2
import argparse

CLASS_NAMES = {
    0: "sampah_plastik (Botol, Kemasan Snack, Kresek)",
    1: "kardus",
    2: "jelantah",
    3: "organik",
    4: "kertas"
}

def capture_samples(item_name: str, class_id: int, num_samples: int = 35, cam_index: int = 0):
    base_dir = Path(__file__).resolve().parent.parent
    dataset_dir = base_dir / "datasets" / "waste_detection"
    train_img = dataset_dir / "images" / "train"
    train_lbl = dataset_dir / "labels" / "train"
    val_img = dataset_dir / "images" / "val"
    val_lbl = dataset_dir / "labels" / "val"

    for p in [train_img, train_lbl, val_img, val_lbl]:
        p.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(cam_index)
    if not cap.isOpened():
        print(f"[ERROR] Gagal membuka kamera {cam_index}")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    print("=" * 65)
    print(f" PACUL - PEREKAM SAMPEL SAMPAH LOKAL: {item_name.upper()}")
    print(f" Target Kelas: {class_id} -> {CLASS_NAMES.get(class_id, class_id)}")
    print("=" * 65)
    print(" INSTRUKSI:")
    print(" 1. Pegang objek (misal: Botol Cleo / Chitato) di dalam KOTAK HIJAU di layar.")
    print(" 2. Tekan tombol [SPASI] untuk mulai merekam otomatis.")
    print(" 3. Putar-putar sedikit objeknya (depan, belakang, miring) agar AI belajar semua sisi.")
    print(" 4. Tekan 'q' jika ingin membatalkan.")
    print("=" * 65)

    recording = False
    captured = 0
    last_capture_time = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        h, w = frame.shape[:2]
        
        # Kotak panduan di tengah layar (area objek)
        box_w = int(w * 0.45)
        box_h = int(h * 0.65)
        x1 = (w - box_w) // 2
        y1 = (h - box_h) // 2
        x2 = x1 + box_w
        y2 = y1 + box_h

        display_frame = frame.copy()

        # Warna kotak panduan
        box_color = (0, 0, 255) if not recording else (0, 255, 0)
        cv2.rectangle(display_frame, (x1, y1), (x2, y2), box_color, 2)

        if not recording:
            cv2.putText(display_frame, f"Arahkan {item_name.upper()} ke kotak ini", (x1, y1 - 15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(display_frame, "Tekan [SPASI] untuk Mulai Merekam", (40, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        else:
            cv2.putText(display_frame, f"MEREKAM: {captured}/{num_samples} (Putar perlahan objeknya...)", (40, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            # Rekam tiap 200ms
            now = time.time()
            if now - last_capture_time > 0.22 and captured < num_samples:
                last_capture_time = now
                captured += 1

                # Normalisasi koordinat YOLO
                xc = ((x1 + x2) / 2.0) / w
                yc = ((y1 + y2) / 2.0) / h
                nw = box_w / w
                nh = box_h / h

                is_val = (captured % 5 == 0)
                dest_i = val_img if is_val else train_img
                dest_l = val_lbl if is_val else train_lbl

                timestamp = int(time.time() * 1000)
                fname = f"local_{item_name}_{timestamp}_{captured:03d}"

                # Simpan gambar asli
                cv2.imwrite(str(dest_i / f"{fname}.jpg"), frame)
                # Simpan anotasi YOLO
                (dest_l / f"{fname}.txt").write_text(f"{class_id} {xc:.6f} {yc:.6f} {nw:.6f} {nh:.6f}\n")

                if captured >= num_samples:
                    print(f"\n[SUKSES] Berhasil merekam {captured} foto {item_name}!")
                    break

        cv2.imshow("PACUL - Data Collector", display_frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            recording = True
        elif key == ord('q'):
            print("[INFO] Dibatalkan pengguna.")
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"[SELESAI] Data tersimpan di datasets/waste_detection/ untuk training!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PACUL Local Sample Capture Tool")
    parser.add_argument("--name", type=str, required=True, help="Nama objek (misal: chitato, cleo_kecil, indomie)")
    parser.add_argument("--cls", type=int, default=0, help="Class ID: 0=sampah_plastik, 1=kardus, 2=jelantah, 3=organik, 4=kertas")
    parser.add_argument("--samples", type=int, default=35, help="Jumlah foto (default: 35)")
    args = parser.parse_args()

    capture_samples(args.name, args.cls, args.samples)
