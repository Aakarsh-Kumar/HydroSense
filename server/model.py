import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from sklearn.ensemble import IsolationForest
import os

class SmartWaterManagement:
    def __init__(self, csv_path="water_usage_data.csv"):
        self.csv_path = csv_path
        self.df = self.load_data()
        self.train_models()

    def load_data(self):
        if os.path.exists(self.csv_path):
            df = pd.read_csv(self.csv_path, parse_dates=["timestamp"])
            df.set_index("timestamp", inplace=True)

            df = df[~df.index.duplicated(keep='last')].sort_index()
            df["water_usage"].fillna(method="ffill", inplace=True)  
            df["water_usage"].fillna(df["water_usage"].mean(), inplace=True)  
        else:
            np.random.seed(42)
            timestamps = pd.date_range(start="2025-04-01", periods=7*24, freq="H")
            water_usage = np.random.normal(loc=10, scale=2, size=len(timestamps))
            df = pd.DataFrame({"timestamp": timestamps, "water_usage": water_usage})
            df.set_index("timestamp", inplace=True)
            df.to_csv(self.csv_path)
        return df

    def train_models(self):
        cleaned_data = self.df.dropna()  
        if not cleaned_data.empty:
            self.model_arima = ARIMA(cleaned_data["water_usage"], order=(5,1,0))
            self.model_fit = self.model_arima.fit()
            self.iso_forest = IsolationForest(contamination=0.05, random_state=42)
            self.iso_forest.fit(cleaned_data[["water_usage"]])

    def detect_leak(self, live_flow_rate, total_water_usage=None):
        if total_water_usage is not None and not np.isnan(total_water_usage):
            new_entry = pd.DataFrame(
                {"timestamp": [pd.Timestamp.now().floor("H")], "water_usage": [total_water_usage]}
            )
            new_entry.set_index("timestamp", inplace=True)

            self.df = pd.concat([self.df, new_entry])
            self.df = self.df[~self.df.index.duplicated(keep='last')].sort_index()

            self.df.to_csv(self.csv_path)
            self.train_models()

        try:
            future_forecast = self.model_fit.forecast(steps=1)
            expected_usage = round(float(future_forecast.iloc[0]), 2)
        except Exception as e:
            expected_usage = round(self.df["water_usage"].mean(), 2)

        average_usage = self.df["water_usage"].mean()
        threshold = average_usage * 1.5  

        anomaly_score = self.iso_forest.decision_function([[live_flow_rate]])[0]

        if live_flow_rate > average_usage:
            leak_status = "Potential Leak" if live_flow_rate < threshold else "Leak Detected"
            overuse_factor = min(1, (live_flow_rate - average_usage) / (threshold - average_usage))
            leak_probability = round(overuse_factor * 100, 2)
        else:
            leak_status = "Normal"
            leak_probability = round(max(0, min(100, anomaly_score * 100)), 2)

        return {
            "live_flow_rate": live_flow_rate,
            "expected_usage": expected_usage,
            "leak_status": leak_status,
            "leak_probability": f"{leak_probability}%",
        }
smart_water_system = SmartWaterManagement()
live_flow_rate = 11 
total_water_usage = 10

result = smart_water_system.detect_leak(live_flow_rate, total_water_usage)
print(result)
