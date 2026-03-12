import React, { useRef, useEffect } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';

const WebcamMonitor = ({ onDetection }) => {
    const videoRef = useRef(null);
    const faceMeshRef = useRef(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        // --- 1. EAR Calculation Logic ---
        const calculateEAR = (landmarks) => {
            const p2_p6 = Math.hypot(landmarks[160].x - landmarks[144].x, landmarks[160].y - landmarks[144].y);
            const p3_p5 = Math.hypot(landmarks[158].x - landmarks[153].x, landmarks[158].y - landmarks[153].y);
            const p1_p4 = Math.hypot(landmarks[33].x - landmarks[133].x, landmarks[33].y - landmarks[133].y);
            return (p2_p6 + p3_p5) / (2.0 * p1_p4);
        };

        // --- 2. Initialize FaceMesh ---
        faceMeshRef.current = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMeshRef.current.setOptions({ 
            maxNumFaces: 1, 
            refineLandmarks: true, 
            minDetectionConfidence: 0.6, // Increased for better accuracy online
            minTrackingConfidence: 0.6 
        });

        faceMeshRef.current.onResults((results) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];
                const ear = calculateEAR(landmarks);
                const mar = Math.hypot(landmarks[13].x - landmarks[14].x, landmarks[13].y - landmarks[14].y) * 10;
                
                onDetection(ear, mar);
            }
        });

        // --- 3. Initialize Camera ---
        if (videoRef.current) {
            cameraRef.current = new cam.Camera(videoRef.current, {
                onFrame: async () => { 
                    if (faceMeshRef.current && videoRef.current) {
                        try {
                            await faceMeshRef.current.send({ image: videoRef.current });
                        } catch (e) {
                            console.error("Mediapipe Frame Error:", e);
                        }
                    }
                },
                width: 640, 
                height: 480
            });
            cameraRef.current.start();
        }

        // --- 4. CLEANUP (Strict) ---
        return () => {
            console.log("Cleaning up Webcam Sensor...");
            if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
            }
            if (faceMeshRef.current) {
                faceMeshRef.current.close();
                faceMeshRef.current = null;
            }
        };
    }, [onDetection]); // Removed calculateEAR from dependencies as it's now internal

    return (
        <div className="fixed bottom-6 right-6 w-48 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-2xl z-50 bg-slate-900 ring-1 ring-slate-200">
            <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                style={{ transform: 'scaleX(-1)' }} 
                playsInline // Required for iOS/Mobile browsers
                muted // Prevents potential audio-context blocks
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-blue-600/90 backdrop-blur-md text-[9px] text-white px-2 py-1 rounded-full font-bold">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> SENSOR LIVE
            </div>
        </div>
    );
};

export default WebcamMonitor;
