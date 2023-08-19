import React from 'react';
import { ButtonGroup, Button } from '@mui/material/';
import styled from 'styled-components';
import { selectedColor, textColor, defaultMargin } from '../../style-variables';
import {
  useAppViewContext,
  useAppViewDispatch,
} from '../../state_management/Contexts/AppViewContext';

const ViewBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
  position: fixed;
  bottom: 0px;
  width: 300px;
`;

interface ViewButtonProps {
  $isSelected: boolean;
}

// REVIEW: old code:
// const ViewButton = styled(Button)`
//   background: ${({ $isSelected }: ViewButtonProps) => ($isSelected ? textColor : selectedColor)};
// `;

const ViewButton = styled(Button)<ViewButtonProps>`
  background: ${({ $isSelected }: { $isSelected?: boolean }) =>
    $isSelected ? textColor : selectedColor};
`;

/**
 * Selector for view on sidebar. Updates App state with selected view
 */
function BottomButtons() {
  const appViewStateContext = useAppViewContext();
  const appViewDispatchContext = useAppViewDispatch();
  return (
    <ViewBtnGroup variant="contained" fullWidth>
      <ViewButton
        onClick={() => {
          if (!appViewStateContext?.showCreateDialog)
            appViewDispatchContext!({
              type: 'TOGGLE_CONFIG_DIALOG',
            });
        }}
        $isSelected={appViewStateContext!.showCreateDialog}
      >
        Create New Database
      </ViewButton>
    </ViewBtnGroup>
  );
}
export default BottomButtons;
