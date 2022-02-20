import React from 'react';
import styled from 'styled-components';
import {
  IconButton,
  ListItemSecondaryAction,
  Checkbox,
  Tooltip,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import {
  SidebarListItem,
  StyledListItemText,
  textColor,
} from '../../style-variables';
import { QueryData } from '../../types';
import QueryDbname from './QueryDbname';
import { Accordion } from 'react-bootstrap-accordion';

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
    <QueryText primary={query.label} />

    <ListItemSecondaryAction>
      <Tooltip title="drop down">
        {/* <CompareCheck onChange={setComparison} checked={isCompared} /> */}
        <div className="accordion" id="accordionPanelsStayOpenExample"></div>
        <div className="accordion-item">
          <h2 className="accordion-header" id="panelsStayOpen-headingOne">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
              Accordion Item #1
            </button>
          </h2>
          <div id="panelsStayOpen-collapseOne" className="accordion-collapse collapse show" aria-labelledby="panelsStayOpen-headingOne">
            <div className="accordion-body">
              <strong>This is the first item's accordion body.</strong> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
            </div>
          </div>
        </div>
        </div>
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
