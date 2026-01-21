// AI_Fatigue_System/frontend/src/utils/aiService.js

export const sendDataToAI = async (earValue, marValue) => {
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch('http://localhost:5000/api/predict-fatigue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ear: earValue,
                mar: marValue,
                userId: userId
            })
        });

        if (!response.ok) throw new Error('AI Server response not OK');
        const result = await response.json();

        // Update UI logic should ideally be handled by state in React
        return result; 
    } catch (error) {
        console.error("Connection to AI Server failed:", error);
        return null;
    }
};