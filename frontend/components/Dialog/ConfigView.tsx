import React from 'react';
import { Dialog } from '@mui/material';
import BasicTabs from './BasicTabs';
import { sendFeedback } from '../../lib/utils';
import '../../lib/style.css';

interface ConfigViewProps {
  show: boolean;
  onClose: () => void;
}

function ConfigView({ show, onClose }: ConfigViewProps) {
  const handleClose = () => {
    onClose();
  };

  if (!show) return null;
  return (
    <div>
      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={handleClose}
        aria-labelledby="modal-title"
        open={show}
      >
        <BasicTabs onClose={handleClose} />
      </Dialog>
    </div>
  );
}

export default ConfigView;