import React from 'react';
import { render } from 'react-dom';
import { App } from './components/App';

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

render(
  <div>
    <App/>
  </div>,
  document.getElementById('root')
);
