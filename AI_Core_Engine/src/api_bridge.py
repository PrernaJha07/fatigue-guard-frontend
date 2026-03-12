from flask import Flask, jsonify, request
from flask_cors import CORS
from engine import FatigueGuardPro
import os

app = Flask(__name__)
CORS(app)

# --- DYNAMIC PATHING ---
# Works regardless of whether you run from /src or the root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'models')

# Initialize Brain
guard = FatigueGuardPro(
    os.path.join(MODEL_DIR, 'vision_expert.pkl'),
    os.path.join(MODEL_DIR, 'behavior_expert.pkl')
)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "AI Engine Online", "calibrated": guard.is_ready})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        # Added default values to prevent crashes if frontend misses a field
        ear = data.get('ear', 0.3)
        mar = data.get('mar', 0.1)
        t_gap = data.get('typing_gap', 400)
        t_std = data.get('typing_std', 50)
        
        status, score = guard.predict(ear, mar, t_gap, t_std)
        return jsonify({"status": status, "score": round(score, 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Render uses the PORT environment variable
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)
