import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ButtonGroup, Button } from '@mui/material/';
import styled from 'styled-components';
import { AppState, DatabaseInfo, DBType } from '../../../shared/types/types';
import { selectedColor, textColor, defaultMargin } from '../../style-variables';
import { RootState } from '../../state_management/store';
import { selectedView as setSelectedView  } from '../../state_management/Slices/AppViewSlice';

const ViewBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
`;

interface ViewButtonProps {
  $isSelected: boolean;
}

const ViewButton = styled(Button)<ViewButtonProps>`
  background: ${({ $isSelected }: { $isSelected: boolean }) =>
    $isSelected ? selectedColor : textColor};
  &:hover {
    background: ${({ $isSelected }: ViewButtonProps) =>
      $isSelected ? selectedColor : textColor};
  }
`;

// Define the props for the ViewSelector component
type ViewSelectorProps = {
  selectedDb: string;
  setSelectedDb: (dbName: string) => void;
  show: boolean;
  curDBType?: DBType;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo?: DatabaseInfo[];
  setERView?: (value: boolean) => void; // Keep the optional setERView prop
};


/**
 * Selector for view on sidebar. Updates App state with selected view
 */
function ViewSelector({ 
  selectedDb,
  setSelectedDb,
  show,
  curDBType,
  setDBType,
  DBInfo,
  setERView,
 }: ViewSelectorProps) {
  const dispatch = useDispatch();
   // Hook to access the current selected view from the state
  const currentSelectedView = useSelector((state: RootState) => state.appView.selectedView);

  return (
    <ViewBtnGroup variant="contained" fullWidth>
      <ViewButton
        onClick={() =>
          dispatch(
            setSelectedView('queryView')
          )
        }
        $isSelected={currentSelectedView === 'queryView' || currentSelectedView === 'compareView'}
      >
        Queries
      </ViewButton>
      <ViewButton
        onClick={() => {
          dispatch(
            setSelectedView('dbView')
            );
          if (setERView) setERView(true);
        }}
        $isSelected={currentSelectedView === 'dbView' || currentSelectedView === 'quickStartView'}
      >
        Databases
      </ViewButton>
    </ViewBtnGroup>
  );
}

export default ViewSelector;
