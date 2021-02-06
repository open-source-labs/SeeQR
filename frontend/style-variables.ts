/**
 * This file contains all reusable variables for styling in styled-components
 * Individual variables should be named exports
 */
import { createMuiTheme } from '@material-ui/core/styles';
import styled from 'styled-components';
import { Button } from '@material-ui/core/';

interface PaletteColor {
  light?: string;
  main: string;
  dark?: string;
  contrastText?: string;
}
// previous
export const bgColor = '#2b2d35';
export const textColor = '#c6d2d5';
// @import url('https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
// @import url('https://fonts.googleapis.com/css2?family=PT+Mono&display=swap');

// greens
export const greenBlack = '#45584d';
export const greenDark = '#11774e';
export const greenPrimary = '#57a777';
export const greenLight = '#8bbb9b';
export const greenLighter = '#acccbb';
export const greenLightest = '#ccdad4';

// greys
export const greyPrimary = '#818584';
export const greyLight = '#aab6af';
export const greyLightest = '#dfe0e2';

// theme to override Mui defaults
export const MuiTheme =  createMuiTheme({
  palette: {
    primary: {
      light: greenLight,
      main: greenPrimary,
      dark: greenDark,
    },
    secondary: {
      light: greyLightest,
      main: greyLight,
    },
  },
  overrides: {
    MuiButton: {
      root: {
        margin: '8px',
        padding: '8px',
        boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
      },
    },
    MuiIconButton: {
      root: {
        '&:hover': {
          color: greenPrimary,
        }
      }
    }
  }
});

// // typography
// $font-stack: 'PT Sans', sans-serif;
// $font-input: 'PT Mono', monospace;
// $p-weight: 100;
// $title-weight: 300;
// $default-text: 1em;

// // colors
// $background-modal-darkmode: #30353a;
// $background-lightmode: #9abacc;
// $primary-color-lightmode: #1a1a1a;
// $primary-color-darkmode: #c6d2d5;
// $border-darkmode: #444c50;
// $button-darkmode: #596368;
// $background-darkmode-darker: #292a30;
// $mint-green: #6cbba9;
