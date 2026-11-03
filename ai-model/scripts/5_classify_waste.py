#!/usr/bin/env python3
"""
PACUL - 2-Stage Pipeline: Bounding Box Detection -> Waste Categorization & PACUL Integration
Tahap 1: Deteksi Bounding Box objek spesifik (botol plastik, kardus, jelantah, organik, kertas)
Tahap 2: Agregasi & Klasifikasi Kategori Besar Sampah (Anorganik Daur Ulang, Organik, Jelantah)
         serta estimasi poin aksi hijau PACUL.
"""

import sys
import json
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict

# Mapping 5 Kelas Deteksi ke Kategori Besar PACUL
CATEGORY_MAPPING = {
    "sampah_plastik": {
        "macro_category": "Anorganik (Plastik Daur Ulang & Kemasan)",
        "pacul_action_type": "waste_sorting",
        "recyclable": True,
        "base_ecopoints": 50,
        "handling_tip": "Kumpulkan botol plastik, kantong kresek, dan bungkus snack bersih untuk disetorkan ke Bank Sampah Surabaya."
    },
    "botol_plastik": {
        "macro_category": "Anorganik (Plastik Daur Ulang)",
        "pacul_action_type": "waste_sorting",
        "recyclable": True,
        "base_ecopoints": 50,
        "handling_tip": "Remas botol plastik dan pisahkan tutupnya untuk mempermudah pemilahan di Bank Sampah Surabaya."
    },
    "kardus": {
        "macro_category": "Anorganik (Kertas/Kardus Daur Ulang)",
        "pacul_action_type": "waste_sorting",
        "recyclable": True,
        "base_ecopoints": 45,
        "handling_tip": "Lipat kardus hingga pipih dan ikat rapi agar kering dan tidak lembab."
    },
    "kertas": {
        "macro_category": "Anorganik (Kertas Daur Ulang)",
        "pacul_action_type": "waste_sorting",
        "recyclable": True,
        "base_ecopoints": 40,
        "handling_tip": "Pastikan kertas tidak berminyak atau basah sebelum disetorkan."
    },
    "jelantah": {
        "macro_category": "Limbah Rumah Tangga Khusus (Minyak Jelantah / UCO)",
        "pacul_action_type": "used_cooking_oil",
        "recyclable": True,
        "base_ecopoints": 80,
        "handling_tip": "Tampung minyak jelantah dingin ke dalam botol/jeriken tertutup. Jangan dibuang ke wastafel/selokan!"
    },
    "organik": {
        "macro_category": "Sampah Organik (Sisa Makanan / Daun / Kompos)",
        "pacul_action_type": "waste_sorting",
        "recyclable": False,
        "base_ecopoints": 60,
        "handling_tip": "Olah menjadi kompos rumah tangga atau manfaatkan untuk biopori/maggot BSF."
    }
}

@dataclass
class DetectedObject:
    label: str
    confidence: float
    bbox: List[float] # [x1, y1, x2, y2]
    macro_category: str
    action_type: str

@dataclass
class WasteAnalysisReport:
    total_objects: int
    detected_items: List[Dict]
    primary_category: str
    dominant_action_type: str
    estimated_ecopoints: int
    is_valid_green_action: bool
    summary_message: str

def analyze_waste_image(image_path: str, model_path: str = None, min_conf: float = 0.30) -> WasteAnalysisReport:
    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Modul ultralytics belum terinstall.")
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

    model = YOLO(model_path)
    results = model.predict(source=image_path, conf=min_conf, verbose=False)

    detected_items = []
    category_counts: Dict[str, int] = {}
    action_counts: Dict[str, int] = {}

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0].item())
            cls_name = model.names.get(cls_id, f"class_{cls_id}").lower()
            confidence = float(box.conf[0].item())
            xyxy = [round(float(x), 1) for x in box.xyxy[0].tolist()]

            meta = CATEGORY_MAPPING.get(cls_name, {
                "macro_category": "Lainnya / Residu",
                "pacul_action_type": "waste_sorting",
                "recyclable": False,
                "base_ecopoints": 30,
                "handling_tip": "Pastikan sampah dipilah sesuai tempat sampah terpilah."
            })

            detected_items.append({
                "label": cls_name,
                "confidence": round(confidence, 3),
                "bbox": xyxy,
                "category": meta["macro_category"],
                "tip": meta["handling_tip"]
            })

            macro = meta["macro_category"]
            action = meta["pacul_action_type"]
            category_counts[macro] = category_counts.get(macro, 0) + 1
            action_counts[action] = action_counts.get(action, 0) + 1

    total_detected = len(detected_items)
    if total_detected == 0:
        return WasteAnalysisReport(
            total_objects=0,
            detected_items=[],
            primary_category="Tidak Teridentifikasi",
            dominant_action_type="unknown",
            estimated_ecopoints=0,
            is_valid_green_action=False,
            summary_message="Tidak ada sampah terdeteksi dalam foto. Pastikan pencahayaan cukup dan objek terlihat jelas."
        )

    # Menentukan kategori dominan
    primary_category = max(category_counts, key=category_counts.get)
    dominant_action = max(action_counts, key=action_counts.get)

    # Hitung estimasi reward EcoPoints
    total_points = sum(
        CATEGORY_MAPPING.get(item["label"], {}).get("base_ecopoints", 30)
        for item in detected_items
    )
    # Cap maksimum reward per upload (sesuai regulasi PACUL PRD: maks 80-100 poin per aksi)
    awarded_points = min(100, max(40, total_points))

    summary = (
        f"Terdeteksi {total_detected} objek sampah dengan kategori dominan '{primary_category}'. "
        f"Bukti aksi hijau valid untuk diverifikasi ke PACUL (+{awarded_points} EcoPoints)."
    )

    return WasteAnalysisReport(
        total_objects=total_detected,
        detected_items=detected_items,
        primary_category=primary_category,
        dominant_action_type=dominant_action,
        estimated_ecopoints=awarded_points,
        is_valid_green_action=True,
        summary_message=summary
    )

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="PACUL 2-Stage Waste Detection & Classification")
    parser.add_argument("--image", type=str, required=True, help="Path ke foto sampah")
    parser.add_argument("--model", type=str, default=None, help="Path ke model YOLO")
    parser.add_argument("--conf", type=float, default=0.30, help="Confidence threshold")
    args = parser.parse_args()

    report = analyze_waste_image(args.image, args.model, args.conf)
    print(json.dumps(asdict(report), indent=2, ensure_ascii=False))
