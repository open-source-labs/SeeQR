import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Equalizer, Settings, ThreeDRotation } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';

import { textColor, hoverColor, selectedColor } from '../../style-variables';
import { RootState, AppDispatch } from '../../state_management/store';
import {
  selectedView,
  toggleConfigDialog,
} from '../../state_management/Slices/AppViewSlice'; 

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

function TopButtons() {
  // Get the current state of the app view from the Redux store
  const appViewState = useSelector((state: RootState) => state.appView);
  // Get the dispatch function from the Redux store
  const dispatch = useDispatch<AppDispatch>();

  // Function to toggle between compare view and query view
  const toggleCompareView = () => {
    const newView = appViewState.selectedView === 'compareView' ? 'queryView' : 'compareView';
    // Dispatch the selectedView action to update the view
    dispatch(selectedView(newView)); // Dispatch the selectedView action
  };

  // Any of the tool tips are just for whenver you hover over the button, a tooltip will appear
  return (
    <Container>
      <Tooltip title="Config">
        <StyledIconButton onClick={() => dispatch(toggleConfigDialog())}>
          <Settings fontSize="large" />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title="Home">
        <StyledIconButton onClick={() => dispatch(selectedView('quickStartView'))}>
          <HomeIcon fontSize="large" />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title="Compare Queries">
        <StyledIconButton onClick={toggleCompareView}>
          <StyledCompareIcon
            fontSize="large"
            $isSelected={appViewState.selectedView === 'compareView'}
          />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title="3D View">
        <StyledIconButton onClick={() => dispatch(selectedView('threeDView'))}>
          <ThreeDRotation fontSize="large" />
        </StyledIconButton>
      </Tooltip>
    </Container>
  );
}

export default TopButtons;
