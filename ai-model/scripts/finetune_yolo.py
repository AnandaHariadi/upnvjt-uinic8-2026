#!/usr/bin/env python3
"""
PACUL - Quick Fine-Tuning Script
Melanjutkan pembelajaran dari model bobot terbaik (Transfer Learning)
Hanya butuh 15-20 epoch (~1-2 menit di RTX 3050) untuk langsung menguasai objek baru seperti Cleo & Chitato!
"""

import sys
from pathlib import Path
import argparse

def finetune(epochs=20, batch_size=16, imgsz=640):
    try:
        from ultralytics import YOLO
        import torch
    except ImportError:
        print("[ERROR] Modul ultralytics atau torch belum terpasang.")
        sys.exit(1)

    base_dir = Path(__file__).resolve().parent.parent
    weights_path = base_dir / "models" / "best.pt"
    if not weights_path.exists():
        weights_path = base_dir / "models" / "pacul_waste_yolo11s_v2.pt"

    yaml_path = base_dir / "data.yaml"

    print("=" * 65)
    print(" PACUL: Quick Fine-Tuning Model (Adaptasi Produk Lokal)")
    print(f" Memuat bobot awal: {weights_path.name}")
    print(f" Epochs: {epochs} | Batch: {batch_size}")
    print("=" * 65)

    device = 0 if torch.cuda.is_available() else "cpu"
    model = YOLO(str(weights_path))

    results = model.train(
        data=str(yaml_path),
        epochs=epochs,
        imgsz=imgsz,
        batch=batch_size,
        device=device,
        workers=2,
        amp=True,
        project=str(base_dir / "runs" / "waste_detector"),
        name="train_pacul_finetuned",
        exist_ok=True,
        save=True,
        val=True,
        lr0=0.001,       # Learning rate lebih kecil untuk fine-tuning agar tidak merusak bobot lama
        lrf=0.01,
        cos_lr=True
    )

    # Ekspor langsung ke ONNX
    best_pt = base_dir / "runs" / "waste_detector" / "train_pacul_finetuned" / "weights" / "best.pt"
    if best_pt.exists():
        import shutil
        dest_pt = base_dir / "models" / "best.pt"
        shutil.copy2(best_pt, dest_pt)
        print(f"[OK] Bobot baru disalin ke: {dest_pt}")

        # Export ONNX
        finetuned_model = YOLO(str(best_pt))
        onnx_path = finetuned_model.export(format="onnx", imgsz=imgsz, dynamic=True, simplify=True)
        dest_onnx = base_dir / "models" / "best.onnx"
        shutil.copy2(onnx_path, dest_onnx)
        print(f"[OK] Model ONNX diperbarui di: {dest_onnx}")

    print("\n" + "=" * 65)
    print(" FINE-TUNING SELESAI! Model siap diuji lagi di webcam!")
    print("=" * 65)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PACUL Quick Fine-Tuning")
    parser.add_argument("--epochs", type=int, default=15, help="Jumlah epoch fine-tuning (default: 15)")
    parser.add_argument("--batch", type=int, default=16, help="Batch size (default: 16)")
    args = parser.parse_args()

    finetune(epochs=args.epochs, batch_size=args.batch)
