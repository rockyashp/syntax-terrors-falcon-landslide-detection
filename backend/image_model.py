import torch
import numpy as np
import torch.nn.functional as F

from PIL import Image
from transformers import (
    AutoImageProcessor,
    SegformerForSemanticSegmentation
)


class FALCONImageModel:

    def __init__(self, model_path):

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        print("Loading FALCON image model...")

        # Load the EXACT processor used during training/inference
        self.image_processor = AutoImageProcessor.from_pretrained(
            "nvidia/mit-b0"
        )

        # Load trained SegFormer model
        self.model = SegformerForSemanticSegmentation.from_pretrained(
            model_path
        )

        self.model.to(self.device)
        self.model.eval()

        print("✅ FALCON Image Model Loaded")
        print("Device:", self.device)


    def predict(self, image: Image.Image, threshold: float = 1.0):
        """
        threshold: minimum landslide-covered area (in %) required for the
        image-level decision to flip to "LANDSLIDE-LIKE ZONE DETECTED".
        Defaults to 1.0 (%), matching the original prototype behaviour.
        """

        # ---------------------------------------------------------
        # 1. Convert image to RGB
        # ---------------------------------------------------------

        image = image.convert("RGB")

        original_width, original_height = image.size


        # ---------------------------------------------------------
        # 2. EXACT TRAINING/INFERENCE PREPROCESSING
        # ---------------------------------------------------------

        inputs = self.image_processor(
            images=image,
            return_tensors="pt"
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }


        # ---------------------------------------------------------
        # 3. MODEL INFERENCE
        # ---------------------------------------------------------

        with torch.no_grad():

            outputs = self.model(
                **inputs
            )


        # ---------------------------------------------------------
        # 4. RESIZE OUTPUT TO ORIGINAL IMAGE SIZE
        # ---------------------------------------------------------

        logits = outputs.logits

        logits = F.interpolate(
            logits,
            size=(original_height, original_width),
            mode="bilinear",
            align_corners=False
        )


        # ---------------------------------------------------------
        # 5. PROBABILITIES
        # ---------------------------------------------------------

        probabilities = torch.softmax(
            logits,
            dim=1
        )

        # Class 1 = landslide
        landslide_probability_map = (
            probabilities[0, 1]
            .detach()
            .cpu()
            .numpy()
        )


        # ---------------------------------------------------------
        # 6. PIXEL CLASSIFICATION
        # EXACTLY LIKE TEAMMATE'S NOTEBOOK
        # ---------------------------------------------------------

        prediction = (
            probabilities
            .argmax(dim=1)[0]
            .detach()
            .cpu()
            .numpy()
        )

        landslide_mask = (
            prediction == 1
        )


        # ---------------------------------------------------------
        # 7. LANDSLIDE AREA
        # ---------------------------------------------------------

        total_pixels = int(
            landslide_mask.size
        )

        landslide_pixels = int(
            landslide_mask.sum()
        )

        landslide_area_percent = (
            landslide_pixels /
            total_pixels
        ) * 100


        # ---------------------------------------------------------
        # 8. VISUAL CONFIDENCE
        # ---------------------------------------------------------

        if landslide_pixels > 0:

            confidence = (
                landslide_probability_map[
                    landslide_mask
                ].mean()
                * 100
            )

        else:

            confidence = (
                (1 - landslide_probability_map.mean())
                * 100
            )


        # ---------------------------------------------------------
        # 9. IMAGE-LEVEL DECISION
        # SAME PROTOTYPE LOGIC AS TRAINING NOTEBOOK
        # ---------------------------------------------------------

        AREA_THRESHOLD = threshold

        if landslide_area_percent >= AREA_THRESHOLD:

            decision = "LANDSLIDE-LIKE ZONE DETECTED"

        else:

            decision = (
                "NO SIGNIFICANT LANDSLIDE-LIKE "
                "ZONE DETECTED"
            )


        # ---------------------------------------------------------
        # 10. RETURN RESULT
        # ---------------------------------------------------------

        return {

            "decision":
                decision,

            "landslide_area_percent":
                round(
                    float(landslide_area_percent),
                    2
                ),

            # alias kept for API compatibility with /predict/risk
            "landslide_coverage":
                round(
                    float(landslide_area_percent),
                    2
                ),

            "visual_confidence":
                round(
                    float(confidence),
                    2
                ),

            "max_probability":
                round(
                    float(
                        landslide_probability_map.max()
                    ),
                    4
                ),

            "mean_probability":
                round(
                    float(
                        landslide_probability_map.mean()
                    ),
                    4
                ),

            "landslide_pixels":
                landslide_pixels,

            "total_pixels":
                total_pixels,

            "image_width":
                original_width,

            "image_height":
                original_height,

            "area_threshold":
                AREA_THRESHOLD,

            "threshold":
                AREA_THRESHOLD
        }