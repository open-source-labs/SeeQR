import React from 'react';
// import { render } from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './components/App';
// import 'codemirror/lib/codemirror.css';

import '@fontsource/roboto';

const doc = document.createElement('div') as HTMLElement;
doc.id = 'root';
const element = createRoot(doc);
document.body.appendChild(doc);
element.render(<App />);

// const container = document.getElementById('root') as HTMLElement;
// const root = createRoot(container);
// root.render(<App />);
