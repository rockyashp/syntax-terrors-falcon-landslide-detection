from pydantic import BaseModel


class SensorData(BaseModel):

    temperature: float
    humidity: float
    soil_moisture: float

    rainfall: float
    vegetation: float
    slope: float
    soil_saturation: float