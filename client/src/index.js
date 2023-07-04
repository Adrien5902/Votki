// index.js
import React from 'react';
import App from './components/App.jsx';

import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(<App />);