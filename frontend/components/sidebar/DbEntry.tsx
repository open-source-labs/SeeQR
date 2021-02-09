import React from 'react';
import {
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { SidebarListItem } from '../../style-variables';

interface DbEntryProps {
  db: string;
  isSelected: boolean;
  select: () => void;
}
const DbEntry = ({ db, isSelected, select }: DbEntryProps) => (
  <SidebarListItem button customSelected={isSelected} onClick={select}>
    <ListItemText primary={db} />
    <ListItemSecondaryAction>
      <Tooltip title="Drop Database">
        <IconButton edge="end">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </ListItemSecondaryAction>
  </SidebarListItem>
);

export default DbEntry;
