from flask import Flask, jsonify, request
from flask_cors import CORS
from engine import FatigueGuardPro
import os

app = Flask(__name__)
CORS(app)

# Initialize Brain
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
guard = FatigueGuardPro(
    os.path.join(MODEL_DIR, 'vision_expert.pkl'),
    os.path.join(MODEL_DIR, 'behavior_expert.pkl')
)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    status, score = guard.predict(data['ear'], data['mar'], data['typing_gap'], data['typing_std'])
    return jsonify({"status": status, "score": round(score, 2)})

if __name__ == '__main__':
    # Running on 5001
    app.run(host='0.0.0.0', port=5001)