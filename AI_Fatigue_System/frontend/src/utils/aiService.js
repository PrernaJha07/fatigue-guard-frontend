// AI_Fatigue_System/frontend/src/utils/aiService.js

/**
 * Sends real-time sensor data to the Node.js backend for fatigue prediction.
 */
export const sendDataToAI = async (earValue, marValue, typingGap = 400, typingStd = 50, mousePrecision = 100) => {
    
    // --- 1. DYNAMIC API URL ---
    // If VITE_API_URL is set on Render/Vercel, it uses that. 
    // Otherwise, it falls back to localhost for your laptop testing.
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const userStored = localStorage.getItem('user');
    const userData = userStored ? JSON.parse(userStored) : null;
    const userId = userData ? userData.id : 1; 

    try {
        // CHANGED: Using ${API_BASE_URL} instead of hardcoded localhost
        const response = await fetch(`${API_BASE_URL}/api/predict-fatigue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ear: earValue,
                mar: marValue,
                userId: userId,
                typing_gap: typingGap,
                typing_std: typingStd,
                mouse_precision: mousePrecision 
            })
        });

        if (!response.ok) throw new Error('AI Server response not OK');
        
        const result = await response.json();
        return result; 

    } catch (error) {
        console.error("Connection to AI Server failed:", error);
        return null;
    }
};