import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with immediate update checks
const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(swScriptUrl, registration) {
        // Check for updates every 60 seconds (works around GitHub Pages cache headers)
        if (registration) {
            setInterval(
                () => {
                    registration.update();
                },
                60000 // 60 seconds
            );
        }
    },
});

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);
