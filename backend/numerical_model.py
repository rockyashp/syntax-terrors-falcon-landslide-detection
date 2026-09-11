import joblib
import pandas as pd


class FALCONNumericalModel:

    def __init__(self, model_path):

        # Load trained model package
        package = joblib.load(model_path)

        self.model = package["model"]
        self.features = package["features"]
        self.target = package["target"]

        self.risk_mapping = package["risk_mapping"]
        self.sensor_mapping = package["sensor_mapping"]
        self.external_mapping = package["external_mapping"]

        self.validation = package["validation"]

        print("[OK] FALCON Numerical Model Loaded")
        print("Model Type:", package["model_type"])
        print("Features:", self.features)


    def predict(self, data):

        """
        data should contain:

        temperature
        humidity
        soil_moisture
        rainfall
        vegetation
        slope
        soil_saturation
        """

        # Convert backend field names into model feature names
        model_input = {
            "Rainfall_mm": data["rainfall"],
            "Vegetation_Cover": data["vegetation"],
            "Slope_Angle": data["slope"],
            "Soil_Saturation": data["soil_saturation"],
            "Temperature_C": data["temperature"],
            "Humidity_percent": data["humidity"],
            "Soil_Moisture_Content": data["soil_moisture"]
        }

        # Create dataframe in EXACT feature order
        input_df = pd.DataFrame(
            [[model_input[feature] for feature in self.features]],
            columns=self.features
        )

        # Prediction
        prediction = self.model.predict(input_df)[0]

        # Probability
        probabilities = self.model.predict_proba(input_df)[0]

        probability_high = float(probabilities[1])

        # Convert prediction to risk
        risk = self.risk_mapping[int(prediction)]

        return {
            "prediction": int(prediction),
            "risk": risk,
            "high_risk_probability": round(probability_high, 4),
            "model_type": "XGBoost",
            "model_version": "FALCON",
            "input_features": model_input
        }