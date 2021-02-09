import React from 'react';
import {
  IconButton,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Button,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { SidebarListItem } from '../../style-variables';

interface DbEntryProps {
  db: string;
  isSelected: boolean;
  select: () => void;
  duplicate: () => void;
}
const DbEntry = ({ db, isSelected, select, duplicate }: DbEntryProps) => (
  <SidebarListItem button customSelected={isSelected} onClick={select}>
    <ListItemText primary={db} />
    <ListItemSecondaryAction>
      <Button onClick={duplicate}>DUPE</Button>
      <Tooltip title="Drop Database">
        <IconButton edge="end">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </ListItemSecondaryAction>
  </SidebarListItem>
);

export default DbEntry;
