import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import styled from 'styled-components';
import { HelpOutline, ArrowBackIos, Equalizer } from '@material-ui/icons';
import { AppState } from '../../types';

import { textColor, hoverColor, selectedColor } from '../../style-variables';
import { Settings } from '@mui/icons-material';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledIconButton = styled(IconButton)`
  margin: 15px;
`;

interface StyledCompareButtonProps {
  $isSelected: boolean;
}

const StyledCompareIcon = styled(Equalizer)<StyledCompareButtonProps>`
  color: ${({ $isSelected }) => ($isSelected ? selectedColor : textColor)};
  &:hover {
    color: ${hoverColor};
  }
`;

type TopButtonsProps = Pick<AppState, 'selectedView' | 'setSelectedView'> & {
  toggleOpen: () => void;
  setConfigDialog: (show: boolean) => void;
};

const TopButtons = ({
  selectedView,
  setSelectedView,
  toggleOpen,
  setConfigDialog,
}: TopButtonsProps) => {
  const toggleCompareView = () => {
    if (selectedView === 'compareView') return setSelectedView('queryView');
    return setSelectedView('compareView');
  };

  return (
    <Container>
      <Tooltip title="Config">
        <StyledIconButton onClick={() => setConfigDialog(true)}>
          <Settings fontSize="large" />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title="Help">
        <StyledIconButton onClick={() => setSelectedView('quickStartView')}>
          <HelpOutline fontSize="large" />
        </StyledIconButton>
      </Tooltip>
      
      <Tooltip title="Compare Queries">
        <StyledIconButton onClick={toggleCompareView}>
          <StyledCompareIcon
            fontSize="large"
            $isSelected={selectedView === 'compareView'}
          />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title="Hide Sidebar">
        <StyledIconButton onClick={toggleOpen}>
          <ArrowBackIos fontSize="large" />
        </StyledIconButton>
      </Tooltip>
    </Container>
  );
};

export default TopButtons;
