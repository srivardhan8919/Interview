import React, { useState, useEffect } from 'react';
import api from '../api';
import CursorEffect from './CursorEffect';

const SplashScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('Preparing your interview environment...');
    const [isReady, setIsReady] = useState(false);
    const [isZooming, setIsZooming] = useState(false);

    useEffect(() => {
        const startTime = Date.now();
        const MIN_DURATION = 2500; // 2.5 seconds minimum
        const MAX_DURATION = 15000; // 15 seconds maximum
        const POLL_INTERVAL = 3000; // Poll every 3 seconds

        let healthCheckInterval;
        let progressInterval;
        let backendReady = false;
        let minTimeElapsed = false;

        // Progress animation
        progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return prev;
                return prev + 1;
            });
        }, 150);

        // Check if minimum time has elapsed
        const minTimer = setTimeout(() => {
            minTimeElapsed = true;
            if (backendReady) {
                completeTransition();
            }
        }, MIN_DURATION);

        // Maximum duration fallback
        const maxTimer = setTimeout(() => {
            completeTransition();
        }, MAX_DURATION);

        // Health check function
        const checkHealth = async () => {
            try {
                await api.get('/health');
                backendReady = true;
                setProgress(100);
                setMessage('Ready!');

                if (minTimeElapsed) {
                    completeTransition();
                }
            } catch (error) {
                // Silent failure - keep polling
                console.log('Backend warming up...');
            }
        };

        // Complete transition function
        const completeTransition = () => {
            clearInterval(healthCheckInterval);
            clearInterval(progressInterval);
            clearTimeout(minTimer);
            clearTimeout(maxTimer);

            setIsReady(true);
            setProgress(100);
            setIsZooming(true); // Start zoom animation

            // Call onComplete immediately for synchronized login fade-in
            onComplete();
        };

        // Initial health check
        checkHealth();

        // Poll health endpoint
        healthCheckInterval = setInterval(checkHealth, POLL_INTERVAL);

        // Cleanup
        return () => {
            clearInterval(healthCheckInterval);
            clearInterval(progressInterval);
            clearTimeout(minTimer);
            clearTimeout(maxTimer);
        };
    }, [onComplete]);

    return (
        <div className={`splash-screen ${isZooming ? 'splash-zoom-out' : ''}`}>
            <CursorEffect />

            <div className={`splash-content ${isZooming ? 'splash-content-hide' : ''}`}>
                {/* Logo Animation */}
                <div className="splash-logo">
                    <div className={`splash-logo-circle ${isZooming ? 'splash-circle-expand' : ''}`}>
                        <span className="splash-logo-text">I</span>
                    </div>
                    <h1 className="splash-brand">InterviewAce</h1>
                </div>

                {/* Loading Progress */}
                <div className="splash-loading">
                    <p className="splash-message">{message}</p>
                    <div className="splash-progress-bar">
                        <div
                            className="splash-progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="splash-progress-text">{Math.round(progress)}%</p>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
