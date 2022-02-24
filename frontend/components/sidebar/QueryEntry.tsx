import React from 'react';

import styled from 'styled-components';
import {
  IconButton,
  ListItemSecondaryAction,
  Checkbox,
  Tooltip,
  Button
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';
import {
  SidebarListItem,
  StyledListItemText,
  textColor,
} from '../../style-variables';
import { QueryData } from '../../types';
import QueryDbname from './QueryDbname';
import { deleteQuery, setCompare, key as queryKey } from '../../lib/queries';
/******************* ACCORDION ***********************/
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  <SidebarListItem button $customSelected={isSelected} onClick={select}>
    {/* <QueryText primary={query.label} /> */}

    <ListItemSecondaryAction>
      <Tooltip title="drop down">
        {/* <CompareCheck onChange={setComparison} checked={isCompared} /> */}
        <div>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>
                <QueryText primary={query.label} />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {/* //if statement here  */}
                <QueryDbname
                  query={query}
                  isSelected={isSelected}
                  select={select}
                  setComparison={setComparison}
                  isCompared={isCompared}
                  deleteThisQuery={deleteThisQuery}
                />
                test
              </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      </Tooltip>
      <Tooltip title="Save Query">
        <IconButton onClick={saveThisQuery}>
          <SaveIcon fontSize='default' />
        </IconButton>
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
