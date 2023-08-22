import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import styled from 'styled-components';
import { Equalizer, Settings, Coronavirus } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';

import { textColor, hoverColor, selectedColor } from '../../style-variables';

import {
  useAppViewContext,
  useAppViewDispatch,
} from '../../state_management/Contexts/AppViewContext';

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
  // using the context from use context hook, all the app view state is from this.
  const appViewStateContext = useAppViewContext();
  const appViewDispatchContext = useAppViewDispatch();

  // this function toggles the compare view
  const toggleCompareView = () => {
    if (appViewStateContext?.selectedView === 'compareView') {
      return appViewDispatchContext!({
        type: 'SELECTED_VIEW',
        payload: 'queryView',
      });
    }
    return appViewDispatchContext!({
      type: 'SELECTED_VIEW',
      payload: 'compareView',
    });
  };

  return (
    <Container>
      <Tooltip title="Config">
        <StyledIconButton
          onClick={() =>
            appViewDispatchContext!({
              type: 'TOGGLE_CONFIG_DIALOG',
            })
          }
        >
          <Settings fontSize="large" />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title="Home">
        <StyledIconButton
          onClick={() =>
            appViewDispatchContext!({
              type: 'SELECTED_VIEW',
              payload: 'quickStartView',
            })
          }
        >
          <HomeIcon fontSize="large" />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title="Compare Queries">
        <StyledIconButton onClick={toggleCompareView}>
          <StyledCompareIcon
            fontSize="large"
            $isSelected={appViewStateContext?.selectedView === 'compareView'}
          />
        </StyledIconButton>
      </Tooltip>

      <Tooltip title="3D View">
        <StyledIconButton
          onClick={() =>
            appViewDispatchContext!({
              type: 'SELECTED_VIEW',
              payload: 'threeDView',
            })
          }
        >
          <Coronavirus fontSize="large" />
        </StyledIconButton>
      </Tooltip>
    </Container>
  );
}

export default TopButtons;
