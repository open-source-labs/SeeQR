import React, { useState, useEffect } from 'react';
import { IpcMainEvent } from 'electron';
import { Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import { readingTime } from '../../lib/utils';

const { ipcRenderer } = window.require('electron');

type Severity = 'error' | 'success' | 'info' | 'warning';

interface Feedback {
  type: Severity;
  message: string | Record<string, unknown>;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const FeedbackModal = () => {
  const [isOpen, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('info');

  useEffect(() => {
    // TODO: type guard
    const receiveFeedback = (evt: IpcMainEvent, feedback: Feedback) => {
      if (feedback.type === 'error') {
        setSeverity(feedback.type);

        if (typeof feedback.message === 'string') setMessage(feedback.message);
        // TODO: custom messages depending on properties of message.
        else
          setMessage(feedback.message?.toString() ?? 'ERROR: Operation Failed');

        setOpen(true);
      }
    };
    ipcRenderer.on('feedback', receiveFeedback);
    return () => ipcRenderer.removeListener('feedback', receiveFeedback);
  });

  const handleClose = () => setOpen(false);

  return (
    <Snackbar
      open={isOpen}
      onClose={handleClose}
      autoHideDuration={readingTime(message)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      // disable hiding on clickAway
      ClickAwayListenerProps={{ onClickAway: () => {} }}
    >
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default FeedbackModal;
