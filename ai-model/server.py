import io
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

app = FastAPI(title="BONI Waste AI Inference Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load custom trained model
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "best.pt"
if not MODEL_PATH.exists():
    MODEL_PATH = BASE_DIR / "models" / "pacul_waste_yolo11n.pt"

print(f"[BONI AI] Memuat model YOLO dari: {MODEL_PATH}")
model = YOLO(str(MODEL_PATH))

CLASS_NAMES = {
    0: "sampah_plastik",
    1: "kardus",
    2: "jelantah",
    3: "organik",
    4: "kertas",
}

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model": MODEL_PATH.name,
        "classes": list(CLASS_NAMES.values()),
    }

@app.post("/predict")
async def predict_waste(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diunggah harus berupa gambar.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        width, height = image.size

        # Run inference
        results = model(image, conf=0.25, verbose=False)
        first_res = results[0]

        detections = []
        labels_summary = {}

        if first_res.boxes is not None and len(first_res.boxes) > 0:
            for box in first_res.boxes:
                cls_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                label_name = CLASS_NAMES.get(cls_id, f"class_{cls_id}")

                xyxy = box.xyxy[0].tolist()  # [xmin, ymin, xmax, ymax]
                detections.append({
                    "class_id": cls_id,
                    "label": label_name,
                    "confidence": round(confidence, 3),
                    "box": {
                        "x1": round(xyxy[0], 1),
                        "y1": round(xyxy[1], 1),
                        "x2": round(xyxy[2], 1),
                        "y2": round(xyxy[3], 1),
                    },
                })

                if label_name not in labels_summary or confidence > labels_summary[label_name]:
                    labels_summary[label_name] = round(confidence, 3)

        return {
            "success": True,
            "image_size": {"width": width, "height": height},
            "detections_count": len(detections),
            "detections": detections,
            "detected_labels": [
                {"name": name, "score": score} for name, score in labels_summary.items()
            ],
            "verified": len(detections) > 0,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
