import React from 'react';
import { ButtonGroup, Button } from '@material-ui/core/';
import styled from 'styled-components';
import { ipcRenderer } from 'electron';
import { AppState, DBType, DatabaseInfo } from '../../types';
import { selectedColor, textColor, defaultMargin } from '../../style-variables';
import { sendFeedback } from '../../lib/utils';

const ViewBtnGroup = styled(ButtonGroup)`
  margin: ${defaultMargin} 5px;
  position: fixed;
  bottom: 0px;
  width: 300px;
`;

interface ViewButtonProps {
  $isSelected: boolean;
}

const ViewButton = styled(Button)`
  background: ${({ $isSelected }: ViewButtonProps) =>
    $isSelected ? textColor : selectedColor};

`;


type ViewSelectorProps = Pick<AppState, 'selectedView' | 'setSelectedView' | 'setSelectedDb' | 'selectedDb'>
& {
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
  setDBInfo: (dbInfo: DatabaseInfo[] | undefined) => void;
  showCreateDialog: boolean;
  setCreateDialog: (show: boolean) => void;
};

/**
 * Selector for view on sidebar. Updates App state with selected view
 */
const BottomButtons = ({ selectedView, setSelectedView, setSelectedDb, selectedDb, curDBType, setDBType, DBInfo, setDBInfo, showCreateDialog, setCreateDialog}: ViewSelectorProps) => (
  <ViewBtnGroup variant="contained" fullWidth>
    <ViewButton
      onClick={() => {
        setCreateDialog(true);
      }}
      $isSelected={showCreateDialog}
    >
      Create New Database
    </ViewButton>
  </ViewBtnGroup>
);
export default BottomButtons;
