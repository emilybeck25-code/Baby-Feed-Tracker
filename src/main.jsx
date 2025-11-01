import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with immediate update checks
const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swScriptUrl, registration) {
        // Check for updates every 60 seconds (works around GitHub Pages cache headers)
        if (registration) {
            setInterval(() => registration.update(), 60000);
        }
    },
    onNeedRefresh() {
        const shouldReload = window.confirm('A new version is ready. Update now?');
        if (shouldReload) {
            updateSW(true);
        }
    },
});

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);
