/**
 * Sends real-time sensor data to the Node.js backend for fatigue prediction.
 * Supports both local development and cloud deployment.
 */
export const sendDataToAI = async (earValue, marValue, typingGap = 400, typingStd = 50, mousePrecision = 100) => {
    
    // 1. Dynamic API URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // 2. Retrieve User & Token from Storage
    const userStored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    const userData = userStored ? JSON.parse(userStored) : null;
    const userId = userData ? userData.id : 1; 

    try {
        const response = await fetch(`${API_BASE_URL}/api/predict-fatigue`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Added Authorization header for cloud security
                'Authorization': token ? `Bearer ${token}` : '' 
            },
            body: JSON.stringify({
                ear: earValue,
                mar: marValue,
                userId: userId,
                typing_gap: typingGap,
                typing_std: typingStd,
                mouse_precision: mousePrecision 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'AI Server response not OK');
        }
        
        const result = await response.json();
        return result; 

    } catch (error) {
        // Detailed logging helps find issues faster on Render
        console.error("AI Service Error:", error.message);
        return null;
    }
};
