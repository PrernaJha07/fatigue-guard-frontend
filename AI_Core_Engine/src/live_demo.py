import os
import warnings
import cv2
import mediapipe as mp
import numpy as np
import csv
from datetime import datetime
from engine import FatigueGuardPro
from scipy.spatial import distance as dist
from mediapipe.python.solutions import face_mesh as mp_face_mesh

# 1. SILENCE THE TERMINAL
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
warnings.filterwarnings("ignore", category=UserWarning)

# 2. SMART PATHS
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODEL_DIR = os.path.join(BASE_DIR, 'models')
LOG_FILE = os.path.join(DATA_DIR, 'fatigue_log.csv')

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['Timestamp', 'EAR', 'MAR', 'Status', 'Score'])

# --- SETTINGS ---
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]
MOUTH = [61, 291, 39, 181, 0, 17, 269, 405]
fatigue_counter = 0
BUFFER_THRESHOLD = 6 

def get_ratio(landmarks, points):
    A = dist.euclidean(landmarks[points[1]], landmarks[points[5]])
    B = dist.euclidean(landmarks[points[2]], landmarks[points[4]])
    C = dist.euclidean(landmarks[points[0]], landmarks[points[3]])
    return (A + B) / (2.0 * C)

# --- INITIALIZE ---
guard = FatigueGuardPro(
    os.path.join(MODEL_DIR, 'vision_expert.pkl'), 
    os.path.join(MODEL_DIR, 'behavior_expert.pkl')
)
face_mesh = mp_face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.7)

cap = cv2.VideoCapture(0)
print(f"🚀 Live Monitor Active. Logging to: {LOG_FILE}")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    # --- SAFETY INITIALIZATION ---
    ear, mar = 0.0, 0.0
    status_display = "FACE NOT DETECTED"
    ui_color = (255, 255, 255) 

    if results.multi_face_landmarks:
        lms = [[lm.x * w, lm.y * h] for lm in results.multi_face_landmarks[0].landmark]
        ear = (get_ratio(lms, LEFT_EYE) + get_ratio(lms, RIGHT_EYE)) / 2.0
        mar = get_ratio(lms, MOUTH)
        
        status, score = guard.predict(ear, mar, 400, 50)
        
        if "CALIBRATING" not in status:
            with open(LOG_FILE, 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([datetime.now().strftime("%H:%M:%S"), round(ear, 3), round(mar, 3), status, round(score, 2)])

        if "CALIBRATING" in status:
            status_display = "CALIBRATING USER..."
            try:
                percent = int(status.split('|')[1].replace('%', '').strip())
                bar_w = int((percent / 100) * 200)
                cv2.rectangle(frame, (w//2-100, 80), (w//2+100, 95), (50, 50, 50), -1)
                cv2.rectangle(frame, (w//2-100, 80), (w//2-100+bar_w, 95), (0, 255, 255), -1)
            except: pass
        elif "FATIGUE" in status:
            fatigue_counter += 1
            if fatigue_counter >= BUFFER_THRESHOLD:
                status_display = "FATIGUE DETECTED"
                ui_color = (0, 0, 255)
            else:
                status_display = "MONITORING..."
                ui_color = (0, 255, 0)
        else:
            fatigue_counter = 0
            status_display = "ALERT AND FOCUSED"
            ui_color = (0, 255, 0)

    # UI RENDERING
    cv2.rectangle(frame, (0, 0), (w, 60), (0, 0, 0), -1)
    cv2.putText(frame, status_display, (20, 42), cv2.FONT_HERSHEY_DUPLEX, 0.9, ui_color, 2)
    # This line now has safe ear/mar values even if face detection fails
    cv2.putText(frame, f"EAR: {ear:.2f}  MAR: {mar:.2f}", (30, h-30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
    
    cv2.imshow('FatigueGuard Pro - Live Monitor', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()
cv2.destroyAllWindows()



# import os
# import warnings
# import cv2
# import mediapipe as mp
# import numpy as np
# import csv
# from datetime import datetime
# from engine import FatigueGuardPro
# from scipy.spatial import distance as dist
# from mediapipe.python.solutions import face_mesh as mp_face_mesh

# # 1. SILENCE THE TERMINAL
# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
# warnings.filterwarnings("ignore", category=UserWarning)

# # 2. SMART PATHS
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# DATA_DIR = os.path.join(BASE_DIR, 'data')
# MODEL_DIR = os.path.join(BASE_DIR, 'models')
# LOG_FILE = os.path.join(DATA_DIR, 'fatigue_log.csv')

# # Ensure the data directory exists
# if not os.path.exists(DATA_DIR):
#     os.makedirs(DATA_DIR)

# # Initialize CSV Log File with Headers
# if not os.path.exists(LOG_FILE):
#     with open(LOG_FILE, 'w', newline='') as f:
#         writer = csv.writer(f)
#         writer.writerow(['Timestamp', 'EAR', 'MAR', 'Status', 'Score'])

# # --- SETTINGS ---
# LEFT_EYE = [362, 385, 387, 263, 373, 380]
# RIGHT_EYE = [33, 160, 158, 133, 153, 144]
# MOUTH = [61, 291, 39, 181, 0, 17, 269, 405]
# fatigue_counter = 0
# BUFFER_THRESHOLD = 6 

# def get_ratio(landmarks, points):
#     A = dist.euclidean(landmarks[points[1]], landmarks[points[5]])
#     B = dist.euclidean(landmarks[points[2]], landmarks[points[4]])
#     C = dist.euclidean(landmarks[points[0]], landmarks[points[3]])
#     return (A + B) / (2.0 * C)

# # --- INITIALIZE ---
# guard = FatigueGuardPro(
#     os.path.join(MODEL_DIR, 'vision_expert.pkl'), 
#     os.path.join(MODEL_DIR, 'behavior_expert.pkl')
# )
# face_mesh = mp_face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.7)

# cap = cv2.VideoCapture(0)
# print(f"🚀 Live Monitor Active. Logging to: {LOG_FILE}")

# while cap.isOpened():
#     ret, frame = cap.read()
#     if not ret: break

#     frame = cv2.flip(frame, 1)
#     h, w, _ = frame.shape
#     results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

#     status_display = "INITIALIZING..."
#     ui_color = (255, 255, 255) 

#     if results.multi_face_landmarks:
#         lms = [[lm.x * w, lm.y * h] for lm in results.multi_face_landmarks[0].landmark]
#         ear = (get_ratio(lms, LEFT_EYE) + get_ratio(lms, RIGHT_EYE)) / 2.0
#         mar = get_ratio(lms, MOUTH)
        
#         status, score = guard.predict(ear, mar, 400, 50)
        
#         # --- NEW CONTINUOUS LOGGING LOGIC ---
#         # We log every frame after calibration so you can see the 'levels' in the CSV
#         if "CALIBRATING" not in status:
#             with open(LOG_FILE, 'a', newline='') as f:
#                 writer = csv.writer(f)
#                 writer.writerow([
#                     datetime.now().strftime("%H:%M:%S"), 
#                     round(ear, 3), 
#                     round(mar, 3), 
#                     status, 
#                     round(score, 2)
#                 ])

#         # --- UI DISPLAY LOGIC ---
#         if "CALIBRATING" in status:
#             status_display = "CALIBRATING USER..."
#             try:
#                 percent = int(status.split('|')[1].replace('%', '').strip())
#                 bar_w = int((percent / 100) * 200)
#                 cv2.rectangle(frame, (w//2-100, 80), (w//2+100, 95), (50, 50, 50), -1)
#                 cv2.rectangle(frame, (w//2-100, 80), (w//2-100+bar_w, 95), (0, 255, 255), -1)
#             except: pass
#         elif "FATIGUE" in status:
#             fatigue_counter += 1
#             if fatigue_counter >= BUFFER_THRESHOLD:
#                 status_display = "FATIGUE DETECTED"
#                 ui_color = (0, 0, 255)
#             else:
#                 status_display = "MONITORING..."
#                 ui_color = (0, 255, 0)
#         else:
#             fatigue_counter = 0
#             status_display = "ALERT AND FOCUSED"
#             ui_color = (0, 255, 0)

#     # UI RENDERING
#     cv2.rectangle(frame, (0, 0), (w, 60), (0, 0, 0), -1)
#     cv2.putText(frame, status_display, (20, 42), cv2.FONT_HERSHEY_DUPLEX, 1.0, ui_color, 2)
#     cv2.putText(frame, f"EAR: {ear:.2f}  MAR: {mar:.2f}", (30, h-30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
    
#     cv2.imshow('FatigueGuard Pro - Live Monitor', frame)
#     if cv2.waitKey(1) & 0xFF == ord('q'): break

# cap.release()
# cv2.destroyAllWindows()