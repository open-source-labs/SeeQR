import React from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import styled from 'styled-components';
import { AppState } from '../../types';
import {
  textColor,
  hoverColor,
  selectedColor,
} from '../../style-variables';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledIconButton = styled(IconButton)`
  margin: 15px;
`;

type TopButtonsProps = Pick<AppState, 'selectedView' | 'setSelectedView'>;

const TopButtons = ({ selectedView, setSelectedView }: TopButtonsProps) => {
  const toggleCompareView = () => {
    if (selectedView === 'compareView') return setSelectedView('queryView');
    return setSelectedView('compareView');
  };

  const StyledCompareButton = styled(EqualizerIcon)`
    color: ${selectedView === 'compareView' ? selectedColor : textColor};
    &:hover {
      color: ${hoverColor};
    }
  `;
  return (
    <Container>
      <StyledIconButton>
        <MenuIcon fontSize="large" />
      </StyledIconButton>
      <Tooltip title="Compare Queries">
        <StyledIconButton onClick={toggleCompareView}>
          <StyledCompareButton fontSize="large" />
        </StyledIconButton>
      </Tooltip>
    </Container>
  );
};

export default TopButtons;
