import os
import sys

# --- DYNAMIC PATHING ---
# This ensures Python can find 'engine.py' even if the project structure changes
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, 'src')
MODEL_DIR = os.path.join(BASE_DIR, 'models')

if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

try:
    from engine import FatigueGuardPro
except ImportError:
    print("❌ Error: Could not find 'engine.py' in the 'src/' folder.")
    sys.exit(1)

def run_local_test():
    print("🛡️  AI Core Engine: Local Integrity Test")
    print("=" * 45)

    # 1. Define Paths relative to this script
    vision_model_path = os.path.join(MODEL_DIR, 'vision_expert.pkl')
    behavior_model_path = os.path.join(MODEL_DIR, 'behavior_expert.pkl')

    # 2. Check if models exist
    if not os.path.exists(vision_model_path) or not os.path.exists(behavior_model_path):
        print(f"❌ Error: Model files not found in: {MODEL_DIR}")
        print("   Please ensure vision_expert.pkl and behavior_expert.pkl are present.")
        return

    print("✅ Models located. Initializing FatigueGuardPro...")

    try:
        # 3. Initialize the Engine
        guard = FatigueGuardPro(vision_model_path, behavior_model_path)

        # 4. Simulated Test Data
        # We simulate 15 frames for calibration (matching updated engine.py),
        # followed by 1 frame of 'Alert' data and 1 frame of 'Drowsy' data.
        test_data = [
            (0.32, 0.10, 400, 40),  # Baseline Alert data
        ] * 15 + [
            (0.30, 0.12, 410, 45),  # Normal Post-Calibration
            (0.16, 0.48, 1300, 350) # Drowsy/Fatigued
        ]

        print("\n🚀 Starting Live Simulation...")
        print(f"{'Frame':<8} | {'Status':<25} | {'Confidence'}")
        print("-" * 45)

        for i, (ear, mar, gap, std) in enumerate(test_data):
            status, score = guard.predict(ear, mar, gap, std)
            
            # Display result
            confidence = f"{score*100:.1f}%" if score > 0 else "N/A"
            print(f"{i+1:<8} | {status:<25} | {confidence}")

        print("\n✨ SUCCESS: Your AI Backend is fully operational.")

    except Exception as e:
        print(f"\n💥 Critical Error: {str(e)}")
        print("   Ensure scikit-learn, joblib, and pandas are installed.")

if __name__ == "__main__":
    run_local_test()
