import React from 'react';
import { ButtonGroup, Button } from '@mui/material/';
import styled from 'styled-components';
import { AppState } from '../../types';
import { selectedColor, textColor, defaultMargin } from '../../style-variables';
import {
  useAppViewContext,
  useAppViewDispatch,
} from '../../state_management/Contexts/AppViewContext';

const ViewBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
`;

interface ViewButtonProps {
  $isSelected: boolean;
}

const ViewButton = styled(Button)<ViewButtonProps>`
  background: ${({ $isSelected }: { $isSelected: boolean }) =>
    $isSelected ? selectedColor : textColor};
  &:hover {
    background: ${({ $isSelected }: ViewButtonProps) =>
      $isSelected ? selectedColor : textColor};
  }
`;

type ViewSelectorProps = Pick<AppState, 'setERView'>;

/**
 * Selector for view on sidebar. Updates App state with selected view
 */
function ViewSelector({ setERView }: ViewSelectorProps) {
  // using the dispatch and state from the providers to avoid any prop drilling.
  const appViewStateContext = useAppViewContext();
  const appViewDispatchContext = useAppViewDispatch();
  return (
    <ViewBtnGroup variant="contained" fullWidth>
      <ViewButton
        onClick={() =>
          appViewDispatchContext!({
            type: 'SELECTED_VIEW',
            payload: 'queryView',
          })
        }
        $isSelected={
          appViewStateContext?.selectedView === 'queryView' ||
          appViewStateContext?.selectedView === 'compareView'
        }
      >
        Queries
      </ViewButton>
      <ViewButton
        onClick={() => {
          appViewDispatchContext!({
            type: 'SELECTED_VIEW',
            payload: 'dbView',
          });
          if (setERView) setERView(true);
        }}
        $isSelected={
          appViewStateContext?.selectedView === 'dbView' ||
          appViewStateContext?.selectedView === 'quickStartView'
        }
      >
        Databases
      </ViewButton>
    </ViewBtnGroup>
  );
}

export default ViewSelector;
