#!/usr/bin/env python3
"""
PACUL - Model Exporter
Mengekspor bobot PyTorch (.pt) ke format ONNX dan TorchScript
agar dapat diintegrasikan ke frontend Next.js (ONNX Web / WebGL) atau API Python ringan.
"""

import sys
from pathlib import Path
import argparse

def export_model(model_path=None, export_format="onnx", imgsz=640):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Modul ultralytics belum terinstall.")
        sys.exit(1)

    base_dir = Path(__file__).resolve().parent.parent
    if model_path is None:
        candidate = base_dir / "runs" / "waste_detector" / "train_pacul" / "weights" / "best.pt"
        if candidate.exists():
            model_path = str(candidate)
        else:
            model_path = "yolo11n.pt"

    print(f"[EXPORT] Memuat model: {model_path}")
    model = YOLO(model_path)

    print(f"[EXPORT] Mengonversi ke format: {export_format.upper()} (imgsz={imgsz})...")
    output_path = model.export(
        format=export_format,
        imgsz=imgsz,
        dynamic=True,
        simplify=True
    )

    print(f"[SUCCESS] Model berhasil diekspor ke: {output_path}")
    return output_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export YOLO model")
    parser.add_argument("--model", type=str, default=None, help="Path ke model .pt")
    parser.add_argument("--format", type=str, default="onnx", choices=["onnx", "torchscript", "tflite"], help="Format target")
    parser.add_argument("--imgsz", type=int, default=640, help="Ukuran resolusi gambar input")
    args = parser.parse_args()

    export_model(args.model, args.format, args.imgsz)
