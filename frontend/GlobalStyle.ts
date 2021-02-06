/**
 * Global styles that are applied by styled-components to all components
 */

import { createGlobalStyle } from 'styled-components';
import { bgColor, textColor } from './style-variables';

const GlobalStyle = createGlobalStyle`

 * {
   /* color: ${textColor} */
 }

 body {
   background: ${bgColor}
 }
 `;

export default GlobalStyle;
