import React, { useRef, useEffect } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';

const WebcamMonitor = ({ onDetection }) => {
    const videoRef = useRef(null);

    // EAR Calculation Logic (Browser Side)
    const calculateEAR = (landmarks) => {
        const p2_p6 = Math.hypot(landmarks[160].x - landmarks[144].x, landmarks[160].y - landmarks[144].y);
        const p3_p5 = Math.hypot(landmarks[158].x - landmarks[153].x, landmarks[158].y - landmarks[153].y);
        const p1_p4 = Math.hypot(landmarks[33].x - landmarks[133].x, landmarks[33].y - landmarks[133].y);
        return (p2_p6 + p3_p5) / (2.0 * p1_p4);
    };

    useEffect(() => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });

        faceMesh.onResults((results) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];
                const ear = calculateEAR(landmarks);
                // Placeholder for MAR - simplified for demo
                const mar = Math.hypot(landmarks[13].x - landmarks[14].x, landmarks[13].y - landmarks[14].y) * 10;
                
                // SEND DATA TO DASHBOARD -> BACKEND
                onDetection(ear, mar);
            }
        });

        if (videoRef.current) {
            const camera = new cam.Camera(videoRef.current, {
                onFrame: async () => { await faceMesh.send({ image: videoRef.current }); },
                width: 640, height: 480
            });
            camera.start();
        }
    }, [onDetection]);

    return (
        <div className="hidden"> {/* Keep hidden if you just want it to work in the background */}
            <video ref={videoRef} />
        </div>
    );
};

export default WebcamMonitor;