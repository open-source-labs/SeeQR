
import React from 'react';
import { AppState } from '../../types';

type TopButtonsProps = Pick<AppState, 'selectedView' | 'setSelectedView'>

const TopButtons = ({ selectedView, setSelectedView }: TopButtonsProps) => {
  const toggleCompareView = () => {
    if (selectedView === 'compareView') return setSelectedView('queryView');
    return setSelectedView('compareView');
  };

  return (
    <div>
      <button type="button">hamburger</button>
      <button type="button" onClick={toggleCompareView}>
        Compare
        {selectedView === 'compareView' ? '<' : ''}
      </button>
    </div>
  );
};

export default TopButtons;