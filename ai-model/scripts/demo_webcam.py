#!/usr/bin/env python3
"""
PACUL - Real-time Webcam Waste Detection Demo
Bisa langsung dipakai untuk mendeteksi sampah lewat kamera laptop secara live!
Tekan tombol 'q' untuk keluar.
"""

import sys
from pathlib import Path
import cv2

COLOR_MAP = {
    "sampah_plastik": (255, 140, 0),   # Biru / Cyan (Botol & Bungkus Snack/Chitato)
    "botol_plastik": (255, 140, 0),
    "kardus": (42, 100, 165),          # Cokelat
    "jelantah": (0, 200, 255),         # Kuning / Emas
    "organik": (50, 180, 50),          # Hijau
    "kertas": (180, 180, 180)          # Abu-abu / Putih
}

def run_webcam(cam_index=0, conf=0.35):
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Modul ultralytics belum terpasang.")
        sys.exit(1)

    base_dir = Path(__file__).resolve().parent.parent
    model_path = base_dir / "models" / "best.pt"
    if not model_path.exists():
        model_path = base_dir / "models" / "pacul_waste_yolo11s_v2.pt"

    print("=" * 60)
    print(" PACUL: Real-Time Live Webcam Waste Detector")
    print(f" Memuat model: {model_path.name}")
    print(" Arahkan sampah (botol, kardus, kertas, organik) ke kamera laptop.")
    print(" Tekan tombol 'q' pada jendela kamera untuk keluar.")
    print("=" * 60)

    model = YOLO(str(model_path))
    cap = cv2.VideoCapture(cam_index)

    if not cap.isOpened():
        print(f"[ERROR] Kamera dengan index {cam_index} tidak dapat dibuka.")
        return

    # Set resolusi 1280x720 atau 640x480
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model.predict(source=frame, conf=conf, verbose=False)
        annotated_frame = frame.copy()

        # Render custom bounding box
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0].item())
                cls_name = model.names.get(cls_id, f"class_{cls_id}")
                conf_val = float(box.conf[0].item())
                xyxy = [int(v) for v in box.xyxy[0].tolist()]

                color = COLOR_MAP.get(cls_name, (0, 255, 0))

                # Gambar kotak
                cv2.rectangle(annotated_frame, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), color, 3)

                # Label teks & background
                label_text = f"{cls_name.upper()} {conf_val*100:.0f}%"
                (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(annotated_frame, (xyxy[0], xyxy[1] - th - 10), (xyxy[0] + tw + 10, xyxy[1]), color, -1)
                cv2.putText(annotated_frame, label_text, (xyxy[0] + 5, xyxy[1] - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Tampilkan Header PACUL
        cv2.putText(annotated_frame, "PACUL AI - Waste Detection Engine (Live)", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(annotated_frame, "Tekan 'q' untuk keluar", (20, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

        cv2.imshow("PACUL - Live Waste Detection", annotated_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] Selesai.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Live Webcam Demo")
    parser.add_argument("--cam", type=int, default=0, help="Webcam index (default: 0)")
    parser.add_argument("--conf", type=float, default=0.35, help="Confidence threshold (default: 0.35)")
    args = parser.parse_args()

    run_webcam(args.cam, args.conf)
