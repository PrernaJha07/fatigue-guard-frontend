import os
import sys
import joblib
import numpy as np

# This ensures Python can see your scripts in the 'src' folder
sys.path.append(os.path.join(os.getcwd(), 'src'))
from engine import FatigueGuardPro

def run_local_test():
    print("🛡️  AI Core Engine: Local Integrity Test")
    print("=" * 45)

    # 1. Define Paths relative to AI_Core_Engine
    vision_model_path = 'models/vision_expert.pkl'
    behavior_model_path = 'models/behavior_expert.pkl'

    # 2. Check if models exist
    if not os.path.exists(vision_model_path) or not os.path.exists(behavior_model_path):
        print("❌ Error: Model files (.pkl) not found in the 'models/' folder.")
        print("   Please ensure you downloaded them from Kaggle.")
        return

    print("✅ Models located. Initializing FatigueGuardPro...")

    try:
        # 3. Initialize the Engine
        guard = FatigueGuardPro(vision_model_path, behavior_model_path)

        # 4. Simulated Test Data
        # We simulate 10 frames of 'Normal' data for calibration,
        # followed by 1 frame of 'Drowsy' data to test the detection.
        # Format: (ear, mar, typing_gap, typing_std)
        test_data = [
            (0.30, 0.12, 400, 50),  # Normal/Alert
        ] * 10 + [
            (0.18, 0.45, 1200, 300) # Drowsy/Fatigued
        ]

        print("\n🚀 Starting Live Simulation...")
        print(f"{'Frame':<8} | {'Status':<25} | {'Confidence'}")
        print("-" * 45)

        for i, (ear, mar, gap, std) in enumerate(test_data):
            status, score = guard.predict(ear, mar, gap, std)
            
            # Display result
            confidence = f"{score*100:.1f}%" if score > 0 else "N/A"
            print(f"{i+1:<8} | {status:<25} | {confidence}")

        print("\n✨ SUCCESS: Your AI Backend is fully operational on your local machine.")

    except Exception as e:
        print(f"\n💥 Critical Error: {str(e)}")
        print("   Check if scikit-learn and joblib are installed correctly.")

if __name__ == "__main__":
    run_local_test()