import React, { useEffect, useState } from 'react';
import { BackdropProps, LinearProgress } from '@mui/material';
import { ipcRenderer } from 'electron';
import styled, { ExecutionContext } from 'styled-components';

interface Props {
  $show: boolean;
}

const StyledLinearProg = styled(LinearProgress)<Props>`
  /* Material Ui Drawer component used by sidebar has z-index: 1200 */
  z-index: 1300;
  height: 5px;
  visibility: ${(props?) => (props.$show ? 'visible' : 'hidden')};
`;
// REVIEW: old code for line 10
// ${({ $show? }: { $show: boolean }) => ($show ? 'visible' : 'hidden')};
let delayTimer: NodeJS.Timeout;
const delay = 500;

function Spinner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const showProgress = () => {
      // show spinner after delay ms
      // using global to disambiguate for ts compiler: https://github.com/Microsoft/TypeScript/issues/30128
      delayTimer = global.setTimeout(() => setShow(true), delay);
    };
    ipcRenderer.on('async-started', showProgress);
    return () => {
      ipcRenderer.removeListener('async-started', showProgress);
    };
  });

  useEffect(() => {
    const hideProgress = () => {
      // kill currently delayed timer if any
      clearTimeout(delayTimer);
      setShow(false);
    };
    ipcRenderer.on('async-complete', hideProgress);
    return () => {
      ipcRenderer.removeListener('async-complete', hideProgress);
    };
  });

  return <StyledLinearProg $show={show} />;
}

export default Spinner;
