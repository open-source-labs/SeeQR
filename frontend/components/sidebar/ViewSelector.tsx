import React from 'react';
import { ButtonGroup, Button } from '@mui/material/';
import styled from 'styled-components';
import { AppState } from '../../types';
import { selectedColor, textColor, defaultMargin } from '../../style-variables';

const ViewBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
`;

interface ViewButtonProps {
  $isSelected: boolean;
}

// REVIEW: old code:
// const ViewButton = styled(Button)`
//   background: ${({ $isSelected }: ViewButtonProps) => ($isSelected ? selectedColor : textColor)};
//   &:hover {
//     background: ${({ $isSelected }: ViewButtonProps) => ($isSelected ? selectedColor : textColor)};
//   }
// `;

const ViewButton = styled(Button)<ViewButtonProps>`
  background: ${({ $isSelected }: { $isSelected: boolean }) =>
    $isSelected ? selectedColor : textColor};
  &:hover {
    background: ${({ $isSelected }: ViewButtonProps) =>
      $isSelected ? selectedColor : textColor};
  }
`;

type ViewSelectorProps = Pick<
  AppState,
  'selectedView' | 'setSelectedView' | 'setERView'
>;

/**
 * Selector for view on sidebar. Updates App state with selected view
 */
function ViewSelector({
  selectedView,
  setSelectedView,
  setERView,
}: ViewSelectorProps) {
  return (
    <ViewBtnGroup variant="contained" fullWidth>
      <ViewButton
        onClick={() => setSelectedView('queryView')}
        $isSelected={
          selectedView === 'queryView' || selectedView === 'compareView'
        }
      >
        Queries
      </ViewButton>
      <ViewButton
        onClick={() => {
          setSelectedView('dbView');
          if (setERView) setERView(true);
        }}
        $isSelected={
          selectedView === 'dbView' || selectedView === 'quickStartView'
        }
      >
        Databases
      </ViewButton>
    </ViewBtnGroup>
  );
}

export default ViewSelector;
