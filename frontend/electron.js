import React from 'react';
import { render } from 'react-dom';
import App from './components/App';


const root = document.createElement("div");

root.id = "root";
document.body.appendChild(root);

render(
  <div>
    <h1>Hiii asdfasdfsadfsSeeQeR</h1>
    <App />
  </div>,
  document.getElementById('root')
);
