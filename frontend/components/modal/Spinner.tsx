import React, { useState, useEffect } from 'react';
import { LinearProgress } from '@material-ui/core';
import styled from 'styled-components';

const { ipcRenderer } = window.require('electron');

const StyledLinearProg = styled(LinearProgress)`
  /* Material Ui Drawer component used by sidebar has z-index: 1200 */
  z-index: 1300;
  height: 2px;
  visibility: ${({ $show }: { $show: boolean }) => ($show ? 'visible' : 'hidden')};
`;

const Spinner = () => {
  const [show, setShow] = useState(false);

  // TODO: ensure timeout is properly cleared and doesn't interfere with component rerender.
  const delay = 0;
  let delayTimer: NodeJS.Timeout

  useEffect(() => {
    const showProgress = () => {
      // show spinner after delay ms
      // using global to disambiguate for ts compiler: https://github.com/Microsoft/TypeScript/issues/30128
      delayTimer = global.setTimeout(() => setShow(true), delay)
    };
    ipcRenderer.on('async-started', showProgress );
    return () => ipcRenderer.removeListener('feedback', showProgress);
  });

  useEffect(() => {
    const hideProgress = () => {
      // kill currently delayed timer if any
      clearTimeout(delayTimer)
      setShow(false)
    };
    ipcRenderer.on('async-complete', hideProgress );
    return () => ipcRenderer.removeListener('feedback', hideProgress);
  });

  return <StyledLinearProg $show={show} />;
};

export default Spinner;
