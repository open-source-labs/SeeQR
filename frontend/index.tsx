import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './components/App';
import store from './state_management/store';
import '@fontsource/roboto';

// Create a rootElement for the React app
const rootElement:HTMLElement = document.createElement('div');
rootElement.id = 'root';
document.body.appendChild(rootElement);

// Use the new createRoot method from react-dom/client
const root = createRoot(rootElement);

// Render the React app with the Redux provider
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);