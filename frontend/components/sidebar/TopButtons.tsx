import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import styled from 'styled-components';
import { AppState } from '../../types';

import { textColor, hoverColor, selectedColor } from '../../style-variables';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledIconButton = styled(IconButton)`
  margin: 15px;
`;

interface StyledCompareButtonProps {
  isSelected: boolean;
}

const StyledCompareIcon = styled(EqualizerIcon)<StyledCompareButtonProps>`
  color: ${({ isSelected }) => (isSelected ? selectedColor : textColor)};
  &:hover {
    color: ${hoverColor};
  }
`;

type TopButtonsProps = Pick<AppState, 'selectedView' | 'setSelectedView'> & {
  toggleOpen: () => void;
};

const TopButtons = ({
  selectedView,
  setSelectedView,
  toggleOpen,
}: TopButtonsProps) => {
  const toggleCompareView = () => {
    if (selectedView === 'compareView') return setSelectedView('queryView');
    return setSelectedView('compareView');
  };

  return (
    <Container>
      <StyledIconButton>
        <MenuIcon fontSize="large" />
      </StyledIconButton>
      <Tooltip title="Compare Queries">
        <StyledIconButton onClick={toggleCompareView}>
          <StyledCompareIcon
            fontSize="large"
            isSelected={selectedView === 'compareView'}
          />
        </StyledIconButton>
      </Tooltip>
      <Tooltip title="Hide Sidebar">
        <StyledIconButton onClick={toggleOpen}>
          <ArrowBackIosIcon fontSize="large" />
        </StyledIconButton>
      </Tooltip>
    </Container>
  );
};

export default TopButtons;
