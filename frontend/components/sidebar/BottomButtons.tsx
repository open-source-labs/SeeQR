import React from 'react';
import { ButtonGroup, Button } from '@mui/material/';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { selectedColor, textColor, defaultMargin } from '../../style-variables';
import { RootState } from '../../state_management/store';
import { toggleCreateDialog } from '../../state_management/Slices/AppViewSlice';

const ViewBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
  position: fixed;
  bottom: 0px;
  width: 300px;
`;

interface ViewButtonProps {
  $isSelected: boolean;
}

const ViewButton = styled(Button)<ViewButtonProps>`
  background: ${({ $isSelected }: { $isSelected?: boolean }) =>
    $isSelected ? textColor : selectedColor};
`;

/**
 * Selector for view on sidebar. Updates App state with selected view
 */
function BottomButtons() {
  // Get the dispatch function from the Redux store
  const dispatch = useDispatch();
  // Get the current state of the showCreateDialog from the Redux store
  const showCreateDialog = useSelector(
    (state: RootState) => state.appView.showCreateDialog,
  );

  // Render a button to create a new database
  return (
    <ViewBtnGroup variant="contained" fullWidth>
      <ViewButton
        onClick={() => {
          if (!showCreateDialog) dispatch(toggleCreateDialog());
        }}
        $isSelected={showCreateDialog}
      >
        Create New Database
      </ViewButton>
    </ViewBtnGroup>
  );
}
export default BottomButtons;
