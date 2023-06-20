/**
 * This file contains all reusable variables for styling in styled-components
 * Individual variables should be named exports
*/

import React from 'react';
import {
  ListItem,
  List,
  Paper,
  DialogTitle,
  Button,
  TextField,
  ListItemText,
  Select,
  NativeSelect,
  adaptV4Theme,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import styled from 'styled-components';
import { InputLabel, MenuItem } from '@mui/material';

// previous
export const bgColor = '#2b2d35';
export const textColor = 'rgb(203, 212, 214)';
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
export const greyDarkest = '#191919';
export const greyDark = '#262626';
export const greyMedium = '#525252';
export const greyPrimary = '#818584';
export const greyLight = '#b9bbba';
export const greyLighter = '#cecfcf';
export const greyLightest = '#dfe0e2';

// Compare Colors
// coolors link to pallete: https://coolors.co/57a777-ee6352-08b2e3-e7bb41-9d75cb-645e9d-35524a-251605-a01a7d
export const compareChartColors = [
  '#57a777ff',
  '#6B2D5C',
  '#2F3061',
  '#B0C6CE',
  '#F0386B',
  '#938BA1',
  '#CBB3BF',
  '#7E4E60',
  '#e7bb41ff',
  '#9d75cbff',
  '#645e9dff',
  '#35524aff',
  '#251605ff',
];

// Icons and Buttons
export const selectedColor = greenPrimary;
export const hoverColor = greenPrimary;

// Size
export const sidebarWidth = '375px';
export const defaultMargin = '20px';
export const tableWidth = `calc(100vw - (${defaultMargin} * 3) - ${sidebarWidth})`;
export const sidebarShowButtonSize = '50px';

// Execution Tree
export const planNodeWidth = '200px';
export const planNodeHeight = '100px';

// theme to override Mui defaults
export const MuiTheme = createTheme(adaptV4Theme({
  typography: {
    fontSize: 16,
  },
  palette: {
    primary: {
      light: greenLight,
      main: selectedColor,
      dark: greenDark,
    },
    secondary: {
      light: greyLight,
      main: greyLightest,
    },
    text: {
      primary: textColor,
      secondary: greyLight,
    },
  },
  overrides: {
    MuiIconButton: {
      root: {
        color: textColor,
        '&:hover': {
          color: hoverColor,
        },
      },
    },
    MuiTooltip: {
      tooltip: {
        fontSize: '1em',
      },
    },
    MuiTab: {
      root: {
        fontSize: 20,
        textTransform: 'none',
      },
    },
  },
}));

export const SidebarList = styled(List)`
  padding: 0;
  width: 100%;
`;

interface SidebarListItemProps {
  $customSelected: boolean;
}

/**
 * Sidebar List item. Designed for dark bg.
 * Takes boolean in $customSelected prop to style selected item
 */
export const SidebarListItem = styled(ListItem)`
  color: ${({ $customSelected }: SidebarListItemProps) =>
    $customSelected ? selectedColor : textColor};
  background: transparent;
  border-bottom: 1px solid transparent;
  border-top: 1px solid transparent;
  width: 100%
  &:hover {
    background: transparent;
    border-bottom: 1px solid ${hoverColor};
    border-top: 1px solid ${hoverColor};
  }
`;

export const DarkPaperFull = styled(({ ...other }) => (
  <Paper elevation={8} {...other} />
))`
  background: ${greyDark};
`;

export const ButtonContainer = styled('div')`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export const TextFieldContainer = styled.a`
  color: #575151;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// export const DropdownContainer = styled.a`
//   margins: 5px;
//   padding-left: 25px;
// `;

export const DropdownContainer = styled.a`
  margins: 5px;
  padding-left: 25px;
`;

export const StyledButton = styled(Button)`
  margin: 10px 20px 20px 0px;
  min-width: 25%;
  height: 10%;
  size: small;
`;

export const StyledInputLabel = styled(InputLabel)`
  padding-left: 25px;
  color: #171616;
`

export const StyledDropdown = styled(Select)`
  width: 90%;
  margin: 10px;
  color: #171616;
`;

export const StyledNativeDropdown = styled(NativeSelect)`
  width: 90%;
  margin: 10px;
  color: #171616;
`;

export const StyledNativeOption = styled.option`
  color: #171616;
  background-color: '#2b2d35';
`

export const StyledMenuItem = styled(MenuItem)`
  color: #171616;
`

export const StyledTextField = styled(TextField)`
  width: 80%;
  margin: 10px;
`;

export const StyledDialogTitle = styled(DialogTitle)`
  margin-bottom: -8px;
`;

export const StyledListItemText = styled(ListItemText)`
  & .MuiListItemText-primary {
    max-width: 15ch;
    overflow-wrap: break-word;
  }
`;
