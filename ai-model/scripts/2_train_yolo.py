#!/usr/bin/env python3
"""
PACUL - Waste Object Detection Training Script
Menggunakan Ultralytics YOLOv8n / YOLOv11n
Dioptimasi khusus untuk GPU RTX 3050 (4GB VRAM) dengan Mixed Precision (AMP).
"""

import os
import sys
from pathlib import Path

def train_yolo(
    data_yaml="data.yaml",
    model_version="yolo11n.pt",  # atau "yolov8n.pt"
    epochs=50,
    batch_size=16,
    imgsz=640,
    workers=2,
    project_name="runs/waste_detector",
    exp_name="train_pacul"
):
    try:
        import torch
        from ultralytics import YOLO
    except ImportError:
        print("\n[ERROR] Modul 'ultralytics' atau 'torch' belum terinstall.")
        print("Silakan jalankan:")
        print("  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124")
        print("  pip install -r requirements.txt\n")
        sys.exit(1)

    print("=" * 60)
    print(" PACUL AI Engine: Training YOLO Waste Object Detection")
    print("=" * 60)

    # Deteksi hardware GPU
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        device = 0
        print(f"[HARDWARE] GPU Terdeteksi: {gpu_name} ({vram_gb:.2f} GB VRAM)")
        
        # Penyesuaian batch size otomatis untuk VRAM 4GB
        if vram_gb <= 4.2 and batch_size > 16:
            print("[INFO] VRAM ~4GB terdeteksi, menurunkan batch_size ke 16 untuk mencegah CUDA OOM.")
            batch_size = 16
    else:
        device = "cpu"
        print("[HARDWARE] GPU CUDA tidak aktif. Menggunakan CPU (training akan lebih lambat).")
        batch_size = 8

    # Resolusi path konfigurasi data.yaml
    base_dir = Path(__file__).resolve().parent.parent
    yaml_path = base_dir / data_yaml
    if not yaml_path.exists():
        print(f"[WARNING] File konfigurasi dataset tidak ditemukan di: {yaml_path}")
        print("Pastikan dataset sudah disiapkan dan data.yaml menunjuk ke path yang benar.")

    print(f"[CONFIG] Model Base   : {model_version}")
    print(f"[CONFIG] Config YAML  : {yaml_path}")
    print(f"[CONFIG] Image Size   : {imgsz}x{imgsz}")
    print(f"[CONFIG] Batch Size   : {batch_size}")
    print(f"[CONFIG] Epochs       : {epochs}")
    print(f"[CONFIG] Precision    : Mixed Precision (AMP=True)")
    print("-" * 60)

    # Inisialisasi model pre-trained (transfer learning)
    model = YOLO(model_version)

    # Eksekusi training
    results = model.train(
        data=str(yaml_path),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        device=device,
        workers=workers,
        amp=True,                  # Hemat VRAM ~50% & lebih cepat di RTX Tensor Core
        project=str(base_dir / project_name),
        name=exp_name,
        exist_ok=True,
        save=True,
        val=True,
        cache=False,
        cos_lr=True,               # Cosine learning rate scheduler untuk konvergensi lebih stabil
        close_mosaic=10,           # Matikan mosaic 10 epoch terakhir agar bounding box makin presisi
        mixup=0.1                  # Campuran multi-objek untuk ketahanan deteksi
    )

    print("\n" + "=" * 60)
    print(" Training Selesai!")
    best_weight = base_dir / project_name / exp_name / "weights" / "best.pt"
    print(f"[OUTPUT] Bobot model terbaik disimpan di:\n  {best_weight}")
    print("=" * 60)

    return results

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="PACUL YOLO Waste Detection Trainer")
    parser.add_argument("--epochs", type=int, default=50, help="Jumlah epoch training (default: 50)")
    parser.add_argument("--batch", type=int, default=16, help="Batch size (default: 16 untuk 4GB VRAM)")
    parser.add_argument("--imgsz", type=int, default=640, help="Resolusi gambar (default: 640)")
    parser.add_argument("--model", type=str, default="yolo11n.pt", help="Base weights: yolo11n.pt atau yolo11s.pt")
    parser.add_argument("--name", type=str, default="train_pacul", help="Nama eksperimen run")
    args = parser.parse_args()

    train_yolo(
        model_version=args.model,
        epochs=args.epochs,
        batch_size=args.batch,
        imgsz=args.imgsz,
        exp_name=args.name
    )
