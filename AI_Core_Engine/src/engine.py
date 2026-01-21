import joblib
import numpy as np
import pandas as pd

class FatigueGuardPro:
    def __init__(self, vision_path, behavior_path):
        # Load the pre-trained Random Forest models
        self.vision_model = joblib.load(vision_path)
        self.behavior_model = joblib.load(behavior_path)
        self.calibration_data = []
        self.is_ready = False
        self.threshold = 0.75  # Confidence level required to trigger an alert

    def get_safe_prob(self, model, data, columns):
        """
        Converts raw data into a DataFrame with feature names 
        to ensure compatibility and suppress UserWarnings.
        """
        df = pd.DataFrame([data], columns=columns)
        probs = model.predict_proba(df)[0]
        
        # Guard against models trained on only one class (prevents IndexError)
        if len(probs) == 1:
            return float(model.classes_[0])
        return probs[1]

    def predict(self, ear, mar, typing_gap, typing_std):
        # --- A. CALIBRATION (Adaptive Baseline) ---
        if not self.is_ready:
            self.calibration_data.append(ear)
            if len(self.calibration_data) >= 10:
                self.is_ready = True
                avg_baseline = np.mean(self.calibration_data)
                return f"READY | Baseline: {avg_baseline:.2f}", 0
            
            progress = len(self.calibration_data) * 10
            return f"CALIBRATING | {progress}%", 0

        # --- B. DUAL INFERENCE (Multi-modal) ---
        # Vision Expert: Analyzes EAR and MAR
        v_prob = self.get_safe_prob(self.vision_model, [ear, mar], ['ear', 'mar'])
        
        # Behavioral Expert: Analyzes Typing Patterns
        b_prob = self.get_safe_prob(self.behavior_model, [typing_gap, typing_std], ['avg_interval', 'std_dev'])
        
        # --- C. WEIGHTED FUSION ---
        # Giving 60% weight to behavior and 40% to vision for robust detection
        final_score = (v_prob * 0.4) + (b_prob * 0.6)

        # --- D. DECISION LOGIC (No Emojis to prevent screen glitch) ---
        if final_score >= self.threshold:
            return "FATIGUE DETECTED", final_score
        elif final_score < 0.35:
            return "ALERT AND FOCUSED", final_score
        else:
            return "MONITORING (Inconclusive)", final_score