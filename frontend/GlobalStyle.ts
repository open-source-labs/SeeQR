/**
 * Global styles that are applied by styled-components to all components
 */

import { createGlobalStyle } from 'styled-components';
import { bgColor } from './style-variables';

const GlobalStyle = createGlobalStyle`
body {
  font-size: 1.2em;
  background: ${bgColor};
}
 `;

export default GlobalStyle;
