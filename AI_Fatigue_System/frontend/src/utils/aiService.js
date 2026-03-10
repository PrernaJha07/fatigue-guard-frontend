// AI_Fatigue_System/frontend/src/utils/aiService.js

/**
 * Sends real-time sensor data to the Node.js backend for fatigue prediction.
 * @param {number} earValue - Eye Aspect Ratio
 * @param {number} marValue - Mouth Aspect Ratio
 * @param {number} typingGap - Average time between keystrokes
 * @param {number} typingStd - Variation in typing speed
 * @param {number} mousePrecision - Smoothness of mouse movement
 */
export const sendDataToAI = async (earValue, marValue, typingGap = 400, typingStd = 50, mousePrecision = 100) => {
    
    // --- FIX: Extracting ID from the 'user' object instead of 'userId' ---
    const userStored = localStorage.getItem('user');
    const userData = userStored ? JSON.parse(userStored) : null;
    const userId = userData ? userData.id : 1; // Fallback to 1 for testing

    try {
        const response = await fetch('http://localhost:5000/api/predict-fatigue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ear: earValue,
                mar: marValue,
                userId: userId,
                typing_gap: typingGap,
                typing_std: typingStd,
                mouse_precision: mousePrecision // Added to pass real mouse data
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