import io
import torch
import torch.nn.functional as F
import numpy as np
import h5py

from transformers import SegformerForSemanticSegmentation


class FALCONSatelliteModel:

    def __init__(self, model_path):

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        print("Loading FALCON 14-band satellite model...")

        # Load saved package
        package = torch.load(
            model_path,
            map_location=self.device,
            weights_only=False
        )

        print("Package type:", type(package))
        print("Package keys:", list(package.keys()))

        # -----------------------------------
        # MODEL METADATA
        # -----------------------------------

        self.model_name = package["model_name"]
        self.num_channels = package["num_channels"]
        self.num_classes = package["num_classes"]
        self.dataset = package["dataset"]
        self.bands = package["bands"]
        self.class_names = package["class_names"]

        self.band_mean = np.asarray(
            package["band_mean"],
            dtype=np.float32
        )

        self.band_std = np.asarray(
            package["band_std"],
            dtype=np.float32
        )

        self.threshold = float(
            package["probability_threshold"]
        )

        self.validation_metrics = package[
            "validation_metrics"
        ]

        # -----------------------------------
        # CREATE 14-BAND SEGFORMER
        # -----------------------------------

        self.model = SegformerForSemanticSegmentation.from_pretrained(
            "nvidia/mit-b0",
            num_labels=self.num_classes,
            num_channels=self.num_channels,
            id2label={
                0: self.class_names[0],
                1: self.class_names[1]
            },
            label2id={
                self.class_names[0]: 0,
                self.class_names[1]: 1
            },
            ignore_mismatched_sizes=True
        )

        # -----------------------------------
        # LOAD TRAINED WEIGHTS
        # -----------------------------------

        self.model.load_state_dict(
            package["model_state_dict"],
            strict=False
        )

        self.model.to(self.device)
        self.model.eval()

        print("✅ FALCON Satellite Model Loaded")
        print("Model:", self.model_name)
        print("Dataset:", self.dataset)
        print("Bands:", self.num_channels)
        print("Classes:", self.class_names)
        print("Threshold:", self.threshold)
        print("Device:", self.device)

    # =======================================
    # H5 PREDICTION
    # =======================================

    def predict_h5(self, h5_bytes):

        # -----------------------------------
        # READ H5 FILE
        # -----------------------------------

        with h5py.File(
            io.BytesIO(h5_bytes),
            "r"
        ) as f:

            if "img" not in f:
                raise ValueError(
                    "H5 file does not contain an 'img' dataset."
                )

            image = np.array(
                f["img"]
            ).astype(np.float32)

        # -----------------------------------
        # VALIDATE INPUT
        # -----------------------------------

        if image.ndim != 3:
            raise ValueError(
                f"Expected 3D image, got shape {image.shape}"
            )

        if image.shape[-1] != self.num_channels:
            raise ValueError(
                f"Expected {self.num_channels} bands, "
                f"got {image.shape[-1]}"
            )

        height, width, channels = image.shape

        # -----------------------------------
        # HWC → CHW
        # -----------------------------------

        image = np.transpose(
            image,
            (2, 0, 1)
        )

        # -----------------------------------
        # NORMALIZATION
        # -----------------------------------

        image_tensor = torch.tensor(
            image,
            dtype=torch.float32
        )

        mean = torch.tensor(
            self.band_mean,
            dtype=torch.float32
        ).view(
            self.num_channels,
            1,
            1
        )

        std = torch.tensor(
            self.band_std,
            dtype=torch.float32
        ).view(
            self.num_channels,
            1,
            1
        )

        image_tensor = (
            image_tensor - mean
        ) / (std + 1e-8)

        # -----------------------------------
        # ADD BATCH DIMENSION
        # -----------------------------------

        image_tensor = image_tensor.unsqueeze(0)
        image_tensor = image_tensor.to(self.device)

        # -----------------------------------
        # MODEL INFERENCE
        # -----------------------------------

        with torch.no_grad():

            outputs = self.model(
                pixel_values=image_tensor
            )

        # -----------------------------------
        # RESIZE LOGITS
        # -----------------------------------

        logits = F.interpolate(
            outputs.logits,
            size=(height, width),
            mode="bilinear",
            align_corners=False
        )

        # -----------------------------------
        # PROBABILITIES
        # -----------------------------------

        probabilities = torch.softmax(
            logits,
            dim=1
        )

        landslide_probability = probabilities[:, 1]

        # -----------------------------------
        # THRESHOLD
        # -----------------------------------

        prediction_mask = (
            landslide_probability >= self.threshold
        )

        probability_map = (
            landslide_probability[0]
            .cpu()
            .numpy()
        )

        mask = (
            prediction_mask[0]
            .cpu()
            .numpy()
        )

        # -----------------------------------
        # STATISTICS
        # -----------------------------------

        total_pixels = int(
            mask.size
        )

        landslide_pixels = int(
            mask.sum()
        )

        coverage = (
            landslide_pixels /
            total_pixels
        ) * 100

        max_probability = float(
            probability_map.max()
        )

        mean_probability = float(
            probability_map.mean()
        )

        # -----------------------------------
        # SIMPLE RISK CLASSIFICATION
        # -----------------------------------

        if coverage >= 20:
            risk = "HIGH"

        elif coverage >= 5:
            risk = "MODERATE"

        elif coverage > 0:
            risk = "LOW"

        else:
            risk = "NONE"

        # -----------------------------------
        # RETURN RESULT
        # -----------------------------------

        return {

            "source": "SATELLITE_14_BAND",

            "model_name": self.model_name,

            "dataset": self.dataset,

            "image_shape": [
                height,
                width,
                channels
            ],

            "bands": self.bands,

            "landslide_pixels":
                landslide_pixels,

            "total_pixels":
                total_pixels,

            "landslide_coverage_percent":
                round(coverage, 2),

            "max_probability":
                round(max_probability, 4),

            "mean_probability":
                round(mean_probability, 4),

            "threshold":
                self.threshold,

            "risk":
                risk,

            "validation_metrics":
                self.validation_metrics
        }