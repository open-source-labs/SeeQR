import React from 'react';

import styled from 'styled-components';
import {
  IconButton,
  ListItemSecondaryAction,
  Checkbox,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import {
  SidebarListItem,
  StyledListItemText,
  textColor,
} from '../../style-variables';
import { QueryData } from '../../types';

const QueryText = styled(StyledListItemText)`
  & .MuiListItemText-secondary {
    color: ${textColor};
  }
`;
const CompareCheck = styled(Checkbox)`
  color: ${textColor};
`;

interface QueryEntryProps {
  query: QueryData;
  isSelected: boolean;
  select: () => void;
  setComparison: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  isCompared: boolean;
  deleteThisQuery: () => void;
  saveThisQuery: () => void;
}

const QueryEntry = ({
  query,
  select,
  isSelected,
  setComparison,
  isCompared,
  deleteThisQuery,
  saveThisQuery,
}: QueryEntryProps) => (
  <SidebarListItem $customSelected={isSelected} onClick={select}>
    <QueryText primary={`${query.label} - ${query.db}`} />
    <ListItemSecondaryAction>
      <Tooltip title="View in Comparison">
        <CompareCheck onChange={setComparison} checked={isCompared} />
      </Tooltip>
      <Tooltip title="Save Query">
        <IconButton onClick={saveThisQuery} size="large">
          <SaveIcon fontSize='inherit' />
        </IconButton>
      </Tooltip>
      <Tooltip title="Forget Query">
        <IconButton edge="end" onClick={deleteThisQuery} size="large">
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </ListItemSecondaryAction>
  </SidebarListItem>
);



export default QueryEntry;
