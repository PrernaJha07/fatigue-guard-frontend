import joblib
import numpy as np
import pandas as pd

class FatigueGuardPro:
    def __init__(self, vision_path, behavior_path):
        try:
            self.vision_model = joblib.load(vision_path)
            self.behavior_model = joblib.load(behavior_path)
        except Exception as e:
            print(f"⚠️ Model Load Warning: {e}. Ensure .pkl files are in /models")
            
        self.calibration_data = []
        self.is_ready = False
        self.threshold = 0.70  # Slightly lowered for better real-world sensitivity

    def get_safe_prob(self, model, data, columns):
        df = pd.DataFrame([data], columns=columns)
        probs = model.predict_proba(df)[0]
        # If model only sees one class during training, probs might be length 1
        return probs[1] if len(probs) > 1 else float(model.classes_[0])

    def predict(self, ear, mar, typing_gap, typing_std):
        # 1. CALIBRATION
        if not self.is_ready:
            self.calibration_data.append(ear)
            if len(self.calibration_data) >= 15: # Increased for better baseline
                self.is_ready = True
                return "READY", 0
            return f"CALIBRATING | {len(self.calibration_data) * 7}%", 0

        # 2. INFERENCE
        v_prob = self.get_safe_prob(self.vision_model, [ear, mar], ['ear', 'mar'])
        b_prob = self.get_safe_prob(self.behavior_model, [typing_gap, typing_std], ['avg_interval', 'std_dev'])
        
        # 3. WEIGHTED FUSION (Behavior is often a better "hidden" indicator)
        final_score = (v_prob * 0.4) + (b_prob * 0.6)

        if final_score >= self.threshold:
            return "FATIGUE DETECTED", final_score
        elif final_score < 0.30:
            return "ALERT AND FOCUSED", final_score
        return "MONITORING", final_score
