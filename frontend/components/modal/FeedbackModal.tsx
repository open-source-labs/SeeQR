import React, { useState, useEffect } from 'react';
import { IpcRendererEvent, ipcRenderer } from 'electron';
import { Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import { readingTime } from '../../lib/utils';
import type { Feedback, FeedbackSeverity } from '../../types';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const FeedbackModal = () => {
  const [isOpen, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<FeedbackSeverity>('info');

  useEffect(() => {
    const receiveFeedback = (evt: IpcRendererEvent, feedback: Feedback) => {
      const validTypes: FeedbackSeverity[] = ['success','error', 'info', 'warning'];
      // Ignore 'success' feedback.
      if (validTypes.includes(feedback.type)) {
        setSeverity(feedback.type);
        setMessage(feedback.message?.toString() ?? 'ERROR: Operation Failed');
        setOpen(true);
      }
    };
    ipcRenderer.on('feedback', receiveFeedback);
    return () => {
      ipcRenderer.removeListener('feedback', receiveFeedback);
    };
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
