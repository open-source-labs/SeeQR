import React from 'react';
import styled from 'styled-components';
import {
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Tooltip,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { SidebarListItem, textColor } from '../../style-variables';
import { QueryData } from '../../types';

const QueryText = styled(ListItemText)`
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
}

const QueryEntry = ({
  query,
  select,
  isSelected,
  setComparison,
  isCompared,
  deleteThisQuery,
}: QueryEntryProps) => (
  <SidebarListItem button $customSelected={isSelected} onClick={select}>
    <QueryText primary={query.label} secondary={query.db} />
    <ListItemSecondaryAction>
      <Tooltip title="View in Comparison">
        <CompareCheck onChange={setComparison} checked={isCompared} />
      </Tooltip>
      <Tooltip title="Forget Query">
        <IconButton edge="end" onClick={deleteThisQuery}>
          <CloseIcon />
        </IconButton>
      </Tooltip>
    </ListItemSecondaryAction>
  </SidebarListItem>
);

export default QueryEntry;
