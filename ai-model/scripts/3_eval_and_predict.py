#!/usr/bin/env python3
"""
PACUL - Waste Object Detection Inference & Visualizer
Menjalankan inferensi gambar, memetakan bounding box, dan menampilkan hasil deteksi.
"""

import sys
from pathlib import Path
import argparse

def run_prediction(image_path, model_path=None, conf=0.35, save_res=True):
    try:
        from ultralytics import YOLO
        import cv2
    except ImportError:
        print("[ERROR] Modul ultralytics atau opencv-python belum terinstall.")
        sys.exit(1)

    base_dir = Path(__file__).resolve().parent.parent
    if model_path is None:
        for cand in [
            base_dir / "models" / "best.pt",
            base_dir / "models" / "pacul_waste_yolo11s_v2.pt",
            base_dir / "runs" / "waste_detector" / "train_pacul_v2" / "weights" / "best.pt",
            base_dir / "runs" / "waste_detector" / "train_pacul" / "weights" / "best.pt",
        ]:
            if cand.exists():
                model_path = str(cand)
                break
        if model_path is None:
            model_path = "yolo11s.pt"

    print(f"[INFO] Memuat model dari: {model_path}")
    model = YOLO(model_path)

    print(f"[INFO] Memproses gambar: {image_path} (Min Conf: {conf})")
    results = model.predict(source=image_path, conf=conf, save=save_res, project=str(base_dir / "runs" / "predict"))

    for r in results:
        print("\n" + "=" * 50)
        print(f"Hasil Deteksi Objek ({len(r.boxes)} objek ditemukan):")
        print("=" * 50)
        for box in r.boxes:
            cls_id = int(box.cls[0].item())
            cls_name = model.names[cls_id]
            confidence = float(box.conf[0].item())
            xyxy = [round(float(x), 1) for x in box.xyxy[0].tolist()]
            print(f" - [{cls_name.upper()}]: Akurasi {confidence*100:.1f}% | Koordinat BBox [x1, y1, x2, y2]: {xyxy}")

    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict waste objects on an image")
    parser.add_argument("--source", type=str, required=True, help="Path ke gambar atau folder gambar")
    parser.add_argument("--model", type=str, default=None, help="Path ke weights model (.pt)")
    parser.add_argument("--conf", type=float, default=0.35, help="Confidence threshold (default: 0.35)")
    args = parser.parse_args()

    run_prediction(args.source, args.model, args.conf)
