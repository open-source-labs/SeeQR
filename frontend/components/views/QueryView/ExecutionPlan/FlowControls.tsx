import React from 'react';
import { useZoomPanHelper } from 'react-flow-renderer';
import { ButtonGroup, Button, Tooltip } from '@material-ui/core';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import FilterCenterFocusIcon from '@material-ui/icons/FilterCenterFocus';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import styled from 'styled-components';

const SquareBtn = styled(Button)`
  padding: 5px;
`;

const Toolbar = styled.div`
  position: absolute;
  z-index: 1000;
  bottom: 5px;
  left: 5px;
`;

interface FlowControlsProps {
  toggleFullscreen: () => void;
  fullscreen: boolean;
}

const FlowControls = ({ toggleFullscreen, fullscreen }: FlowControlsProps) => {
  const { fitView, zoomIn, zoomOut } = useZoomPanHelper();
  const tooltipDelay = 1000

  return (
    <Toolbar>
      <ButtonGroup orientation="vertical" variant="contained" size="small">
        <Tooltip title="Fit tree to view" enterDelay={tooltipDelay}>
          {/* TODO: for large trees this might need to fire up spinner */}
          <SquareBtn onClick={() => fitView({ padding: 0.2 })}>
            <FilterCenterFocusIcon />
          </SquareBtn>
        </Tooltip>
        <Tooltip title="Fullscreen" enterDelay={tooltipDelay}>
          <SquareBtn onClick={toggleFullscreen}>
            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </SquareBtn>
        </Tooltip>
        <Tooltip title="Zoom Out" enterDelay={tooltipDelay}>
          <SquareBtn onClick={() => zoomOut()}>
            <ZoomOutIcon />
          </SquareBtn>
        </Tooltip>
        <Tooltip title="Zoom In" enterDelay={tooltipDelay}>
          <SquareBtn onClick={() => zoomIn()}>
            <ZoomInIcon />
          </SquareBtn>
        </Tooltip>
      </ButtonGroup>
    </Toolbar>
  );
};

export default FlowControls;
