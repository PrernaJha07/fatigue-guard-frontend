import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix
import pandas as pd
import joblib

def generate_report_plots():
    # Example using Vision Model
    visual_csv = 'AI_Core_Engine/data/visual_features.csv'
    model_path = 'AI_Core_Engine/models/vision_expert.pkl'
    
    if os.path.exists(visual_csv) and os.path.exists(model_path):
        df = pd.read_csv(visual_csv)
        df = df[df['ear'] > 0.1]
        X = df[['ear', 'mar']]
        y_true = df['label'].map({0: 0, 5: 1, 10: 1})
        
        model = joblib.load(model_path)
        y_pred = model.predict(X)
        
        cm = confusion_matrix(y_true, y_pred)
        plt.figure(figsize=(7,5))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Greens', 
                    xticklabels=['Alert', 'Fatigued'], yticklabels=['Alert', 'Fatigued'])
        plt.title("Model Reliability: Confusion Matrix")
        plt.xlabel("System Prediction")
        plt.ylabel("Actual User State")
        plt.savefig('AI_Core_Engine/reliability_plot.png')
        print("✅ Confusion Matrix saved as AI_Core_Engine/reliability_plot.png")

if __name__ == "__main__":
    import os
    generate_report_plots()