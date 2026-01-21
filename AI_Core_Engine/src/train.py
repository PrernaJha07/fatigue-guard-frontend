import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

def train_final_experts():
    # Relative paths from the perspective of the project root
    visual_csv = 'AI_Core_Engine/data/visual_features.csv'
    behavior_csv = 'AI_Core_Engine/data/behavioral_features.csv'

    # 1. Train Vision Expert (Targeting ~75.73%)
    if os.path.exists(visual_csv):
        df_v = pd.read_csv(visual_csv)
        # Cleaning: Remove rows where eyes were closed/missing during training
        df_v = df_v[df_v['ear'] > 0.1] 
        X_v = df_v[['ear', 'mar']]
        y_v = df_v['label'].map({0: 0, 5: 1, 10: 1}) # 0=Alert, 1=Fatigued
        
        X_train_v, X_test_v, y_train_v, y_test_v = train_test_split(X_v, y_v, test_size=0.2, random_state=42)
        rf_vision = RandomForestClassifier(n_estimators=100, random_state=42).fit(X_train_v, y_train_v)
        
        joblib.dump(rf_vision, 'AI_Core_Engine/models/vision_expert.pkl')
        print(f"👁️ Vision Accuracy: {accuracy_score(y_test_v, rf_vision.predict(X_test_v))*100:.2f}%")
    
    # 2. Train Behavioral Expert (Targeting 100%)
    if os.path.exists(behavior_csv):
        df_b = pd.read_csv(behavior_csv)
        X_b = df_b[['avg_interval', 'std_dev']]
        y_b = df_b['label']
        
        X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(X_b, y_b, test_size=0.2, random_state=42)
        rf_behavior = RandomForestClassifier(n_estimators=100, random_state=42).fit(X_train_b, y_train_b)
        
        joblib.dump(rf_behavior, 'AI_Core_Engine/models/behavior_expert.pkl')
        print(f"⌨️ Behavioral Accuracy: {accuracy_score(y_test_b, rf_behavior.predict(X_test_b))*100:.2f}%")

    print("✅ Both models saved to AI_Core_Engine/models/")

if __name__ == "__main__":
    train_final_experts()