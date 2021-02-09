import React from 'react';
import { ButtonGroup, Button } from '@material-ui/core/';
import styled from 'styled-components';
import { AppState } from '../../types';
import { selectedColor, textColor, hoverColor } from '../../style-variables';

interface ViewButtonProps {
  isSelected: boolean;
}

const ViewBtnGroup = styled(ButtonGroup)`
  margin: 20px 5px;
`;

const ViewButton = styled(Button)`
  background: ${({ isSelected }: ViewButtonProps) =>
    isSelected ? selectedColor : textColor};
  &:hover {
    background: ${({ isSelected }: ViewButtonProps) =>
      isSelected ? selectedColor : textColor};
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
      isSelected={selectedView === 'queryView' || selectedView === 'compareView'}
    >
      Queries
    </ViewButton>
    <ViewButton
      onClick={() => setSelectedView('dbView')}
      isSelected={selectedView === 'dbView'}
    >
      Databases
    </ViewButton>
  </ViewBtnGroup>
);

export default ViewSelector;
