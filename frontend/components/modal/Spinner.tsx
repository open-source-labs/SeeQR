import React, { useState, useEffect } from 'react';
import { LinearProgress } from '@material-ui/core';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';

const StyledLinearProg = styled(LinearProgress)`
  /* Material Ui Drawer component used by sidebar has z-index: 1200 */
  z-index: 1300;
  height: 5px;
  visibility: ${({ $show }: { $show: boolean }) =>
    $show ? 'visible' : 'hidden'};
`;


let delayTimer: NodeJS.Timeout;
const delay = 500;

const Spinner = () => {
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
};

export default Spinner;
