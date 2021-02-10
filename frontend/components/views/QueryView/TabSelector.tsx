import React from 'react';
import { ButtonGroup, Button, Box } from '@material-ui/core';
import styled from 'styled-components';
import {
  selectedColor,
  textColor,
  defaultMargin,
} from '../../../style-variables';
import type { ValidTabs } from '../../../types';

const ViewBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
`;

interface ViewButtonProps {
  isSelected: boolean;
}

const ViewButton = styled(Button)`
  background: ${({ isSelected }: ViewButtonProps) =>
    isSelected ? selectedColor : textColor};
  &:hover {
    background: ${({ isSelected }: ViewButtonProps) =>
      isSelected ? selectedColor : textColor};
  }
`;

interface TabSelectorProps {
  selectedTab: ValidTabs;
  select: (tab: ValidTabs) => void;
}

const TabSelector = ({ selectedTab, select }: TabSelectorProps) => {
  const tabs: ValidTabs[] = ['Results', 'Execution Plan'];

  return (
    <Box>
      <ViewBtnGroup variant="contained">
        {tabs.map((tab: ValidTabs) => (
          <ViewButton
            isSelected={selectedTab === tab}
            onClick={() => select(tab)}
            key={`querytab_${tab}`}
          >
            {tab}
          </ViewButton>
        ))}
      </ViewBtnGroup>
    </Box>
  );
};

export default TabSelector;
