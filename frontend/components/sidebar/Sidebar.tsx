import { useSelector, useDispatch } from 'react-redux';

// Mui imports
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { Drawer, IconButton, Tooltip } from '@mui/material/';
import React from 'react';
import styled from 'styled-components';
// import logo from '../../../assets/logo/seeqr_dock.png';
import logo from '../../../assets/logo/logo_monochrome.png';
// Types
import { AppState, DatabaseInfo, DBType } from '../../../shared/types/types';
import { RootState } from '../../state_management/store';
// Import Redux action from Slice
import {
  toggleSidebar,
  selectedView,
} from '../../state_management/Slices/AppViewSlice';
import { updateWorkingQuery } from '../../state_management/Slices/QuerySlice';
import BottomButtons from './BottomButtons';
import DbList from './DbList';
import QueryList from './QueryList';
import TopButtons from './TopButtons';
import ViewSelector from './ViewSelector';
import {
  greyDarkest,
  sidebarShowButtonSize,
  sidebarWidth,
} from '../../style-variables';

const StyledDrawer = styled(Drawer)`
  & .MuiDrawer-paper {
    width: ${sidebarWidth};
    padding: 0;
    background: ${greyDarkest};
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;
  }
`;

const Logo = styled.img`
  position: fixed;
  bottom: 50px;
  left: calc(${sidebarWidth} / 2);
  transform: translateX(-50%);
  opacity: 1;
  z-index: -1;
  width: 160px;
  height: 160px;
`;

const ShowSidebarBtn = styled(IconButton)`
  width: 40px;
  height: ${sidebarShowButtonSize};
  position: fixed;
  top: 49%;
  z-index: 200;
  background: #57a777;
  border-radius: 0 15px 15px 0;
  transition: all 0.3s ease;
  &:hover {
    background: #57a777;
    opacity: 0.6;
    color: white;
  }
`;

const HideSidebarBtn = styled(IconButton)`
  width: 40px;
  height: ${sidebarShowButtonSize};
  z-index: 200;
  background: #57a777;
  border-radius: 15px 0 0 15px;
  transition: all 0.3s ease;
  &:hover {
    background: #57a777;
    opacity: 0.6;
    color: white;
  }
`;

const HideSidebarBtnContainer = styled.div`
  position: absolute;
  display: flex;
  width: 15px;
  height: 100vh;
  background: transparent;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: flex-end;
`;

// Props for the Sidebar component
interface SideBarProps {
  selectedDb: AppState['selectedDb'];
  setSelectedDb: AppState['setSelectedDb'];
  setERView: AppState['setERView'];
  curDBType: DBType | undefined;
  setDBType: (dbType: DBType | undefined) => void;
  DBInfo: DatabaseInfo[] | undefined;
  queryDispatch: ({ type, payload }: { type: string; payload?: any }) => void;
}
function Sidebar({
  selectedDb,
  setSelectedDb,
  setERView,
  curDBType,
  setDBType,
  DBInfo,
  queryDispatch,
}: SideBarProps) {
  const dispatch = useDispatch();
  const appViewState = useSelector((state: RootState) => state.appView);

  // Function to toggle the sidebar open or closed
  const toggleOpen = () => {
    dispatch(toggleSidebar());
  };

  /**
   * Show empty query view for user to create new query.
   * Deselects all queries and goes to queryView
   */
  const showEmptyQuery = () => {
    dispatch(selectedView('queryView'));

    queryDispatch({
      type: 'UPDATE_WORKING_QUERIES',
      payload: undefined,
    });
  };

  return (
    <>
      {/* this component just shows tooltip when you hover your mouse over the sidebar open and close button. */}
      <Tooltip title="Show Sidebar">
        <ShowSidebarBtn onClick={toggleOpen} size="small">
          <ArrowForwardIos />
        </ShowSidebarBtn>
      </Tooltip>

      {/* shows if the default menu is open or closed. */}
      <StyledDrawer
        variant="persistent"
        anchor="left"
        open={!appViewState.sideBarIsHidden}
      >
        <div>
          <TopButtons />
          {/* <ViewSelector {...{ setERView }} /> */}
          <ViewSelector
            selectedDb={selectedDb}
            setSelectedDb={setSelectedDb}
            show={true}
            curDBType={curDBType}
            setDBType={setDBType}
            DBInfo={DBInfo}
          />
        </div>
        {/* this is just the list of all the connected dbs */}
        <DbList
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
          // the question marks are just for TypeScript because it thinks there could be a null value, so we're just letting it abide by that strict rule that there is a possibility of a null value.
          show={
            appViewState.selectedView === 'dbView' ||
            appViewState.selectedView === 'quickStartView' ||
            appViewState.selectedView === 'newSchemaView' ||
            appViewState.selectedView === 'threeDView'
          }
          curDBType={curDBType}
          setDBType={setDBType}
          DBInfo={DBInfo}
        />
        {/* this is the view for all your queries that were saved whenever you ran a query */}
        <QueryList
          createQuery={showEmptyQuery}
          show={
            appViewState.selectedView === 'queryView' ||
            appViewState.selectedView === 'compareView'
          }
        />
        <BottomButtons />
        <Logo src={logo} alt="Logo" />
        <HideSidebarBtnContainer>
          <Tooltip title="Hide Sidebar">
            <HideSidebarBtn onClick={toggleOpen} size="large">
              <ArrowBackIos />
            </HideSidebarBtn>
          </Tooltip>
        </HideSidebarBtnContainer>
      </StyledDrawer>
    </>
  );
}

export default Sidebar;
