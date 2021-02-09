import React from 'react';

interface QuickStartViewProps {
  show: boolean;
}

const QuickStartView = ({ show }: QuickStartViewProps) => {
  if (!show) return null;
  return <>Quick Start</>;
};

export default QuickStartView;
