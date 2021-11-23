import React from 'react';
import { ButtonGroup, Button } from '@material-ui/core/';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { AppState } from '../../types';
import { selectedColor, textColor, defaultMargin } from '../../style-variables';
import { sendFeedback } from '../../lib/utils';

const ViewBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
  position: fixed;
  bottom: 0px;
  width: 300px;
`;

interface ViewButtonProps {
  $isSelected: boolean;
}

const ViewButton = styled(Button)`
  background: ${({ $isSelected }: ViewButtonProps) =>
    $isSelected ? selectedColor : textColor};

`;


type ViewSelectorProps = Pick<AppState, 'selectedView' | 'setSelectedView' | 'setSelectedDb' | 'selectedDb'>;

/**
 * Selector for view on sidebar. Updates App state with selected view
 */
const BottomButtons = ({ selectedView, setSelectedView, setSelectedDb, selectedDb}: ViewSelectorProps) => (
  <ViewBtnGroup variant="contained" fullWidth>
    <ViewButton
      onClick={() => {
        setSelectedView('newSchemaView');
        setSelectedDb('');
        
        ipcRenderer
          .invoke('select-db', '')
          .catch(() => 
            sendFeedback({
              type: 'error',
              message: `Database connection error`
            })
          )
      }}
      $isSelected={
        selectedView === 'newSchemaView' || selectedView === 'compareView'
      }
    >
      Create New Database
    </ViewButton>
  </ViewBtnGroup>
);
export default BottomButtons;
