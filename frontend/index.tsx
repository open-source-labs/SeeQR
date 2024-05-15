import React from 'react';
// import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './components/App';
// import 'codemirror/lib/codemirror.css';

import '@fontsource/roboto';

const root = createRoot(document.createElement('div'));
root.id = 'root';
document.body.appendChild(root);

root.render(<App />);

// const container = document.getElementById('root') as HTMLElement;
// const root = createRoot(container);
// root.render(<App />);
