import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Typography,
  Tooltip,
  Slider,
} from '@material-ui/core';
import { debounce } from 'debounce';
import type { Thresholds } from '../../../../types';

interface Props {
  children: React.ReactElement;
  open: boolean;
  value: number;
}

function ValueLabelComponent(props: Props) {
  const { children, open, value } = props;

  return (
    <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

// This is declared outside of the component in order to maintain referential
// integrity for debouncing when component rerenders due to updated state
const updateThresholds = debounce(
  (updater: (newThresholds: Thresholds) => void, newThresholds: Thresholds) => {
    updater(newThresholds);
  },
  500
);

interface ThresholdsDialogProps {
  handleClose: () => void;
  open: boolean;
  thresholds: Thresholds;
  setThresholds: (newThresholds: Thresholds) => void;
}

const ThresholdsDialog = ({
  thresholds,
  setThresholds,
  handleClose,
  open,
}: ThresholdsDialogProps) => {
  // Maintain local state with threshold value in order to control sliders without affecting debouncing
  const [durThres, setDurThres] = useState(thresholds.percentDuration);
  const [accThres, setAccThres] = useState(thresholds.percentDuration);

  const handlePercentChange = (_, newVal: number | number[]) => {
    if (Array.isArray(newVal)) return;
    setDurThres(newVal);
    updateThresholds(setThresholds, { ...thresholds, percentDuration: newVal });
  };

  const handleAccuracyChange = (_, newVal: number | number[]) => {
    if (Array.isArray(newVal)) return;
    setAccThres(newVal);
    updateThresholds(setThresholds, { ...thresholds, rowsAccuracy: newVal });
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Thresholds</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Thresholds used to highlight nodes in the tree.
        </DialogContentText>
        <Typography gutterBottom>Percentage of total duration</Typography>
        <Slider
          ValueLabelComponent={ValueLabelComponent}
          aria-label="custom thumb label"
          value={durThres}
          onChange={handlePercentChange}
        />
        <Typography gutterBottom>Planner rows accuracy</Typography>
        <Slider
          ValueLabelComponent={ValueLabelComponent}
          aria-label="custom thumb label"
          value={accThres}
          onChange={handleAccuracyChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ThresholdsDialog;
