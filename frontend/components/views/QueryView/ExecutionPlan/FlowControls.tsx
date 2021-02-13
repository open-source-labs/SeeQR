import React from 'react';
import { useZoomPanHelper } from 'react-flow-renderer';
import { ButtonGroup, Button, Tooltip } from '@material-ui/core';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
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

const FlowControls = () => {
  const { fitView, zoomIn, zoomOut } = useZoomPanHelper();
  return (
    <Toolbar>
      <ButtonGroup orientation="vertical" variant="contained" size="small">
        <Tooltip title="Fit tree to view">
          {/* TODO: for large trees this might need to fire up spinner */}
          <SquareBtn onClick={() => fitView({padding: 0.2})}>
            <FullscreenIcon />
          </SquareBtn>
        </Tooltip>
        <Tooltip title="Fullscreen">
          <SquareBtn onClick={() => console.log('screen')}>
            <ZoomOutMapIcon />
          </SquareBtn>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <SquareBtn onClick={() => zoomOut()}>
            <ZoomOutIcon />
          </SquareBtn>
        </Tooltip>
        <Tooltip title="Zoom In">
          <SquareBtn onClick={() => zoomIn()}>
            <ZoomInIcon />
          </SquareBtn>
        </Tooltip>
      </ButtonGroup>
    </Toolbar>
  );
};

export default FlowControls;
