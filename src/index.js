import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import QuestlogApp from './questlog-app';

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <QuestlogApp />
    </React.StrictMode>
);