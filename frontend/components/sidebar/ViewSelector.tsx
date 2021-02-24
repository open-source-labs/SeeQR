import React from 'react';
import { ButtonGroup, Button } from '@material-ui/core/';
import styled from 'styled-components';
import { AppState } from '../../types';
import { selectedColor, textColor, defaultMargin } from '../../style-variables';

const ViewBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
`;

interface ViewButtonProps {
  $isSelected: boolean;
}

const ViewButton = styled(Button)`
  background: ${({ $isSelected }: ViewButtonProps) =>
    $isSelected ? selectedColor : textColor};
  &:hover {
    background: ${({ $isSelected }: ViewButtonProps) =>
      $isSelected ? selectedColor : textColor};
  }
`;

type ViewSelectorProps = Pick<AppState, 'selectedView' | 'setSelectedView'>;

/**
 * Selector for view on sidebar. Updates App state with selected view
 */
const ViewSelector = ({ selectedView, setSelectedView }: ViewSelectorProps) => (
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
      onClick={() => setSelectedView('dbView')}
      $isSelected={
        selectedView === 'dbView' || selectedView === 'quickStartView'
      }
    >
      Databases
    </ViewButton>
  </ViewBtnGroup>
);

export default ViewSelector;
