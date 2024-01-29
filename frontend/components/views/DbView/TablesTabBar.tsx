import fs from 'fs';
import { ipcRenderer } from 'electron';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, Tab, Button } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RestorePageIcon from '@mui/icons-material/RestorePage';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from 'styled-components';
import { greyPrimary, greenPrimary } from '../../../style-variables';
import TableDetails from './TableDetails';
import { AppState, TableInfo } from '../../../types';
import { DBType } from '../../../../backend/BE_types';
// import ERTables from '../ERTables/ERTabling';
import stateToReactFlow from '../../../lib/convertStateToReactFlow';
import {
  AddTablesObjType,
  SchemaStateObjType,
  TableHeaderNodeType,
  UpdatesObjType,
} from '../../../types';
import nodeTypes from '../ERTables/NodeTypes';
import * as colors from '../../../style-variables';

//This is apart of the table view
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  selectedDb: string;
  curDBType: DBType | undefined;
}

// const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
//   background-color: ${greenPrimary};
//   margin-bottom: 1em;
// `;

const StyledViewButton = styled(Button)`
  margin: 1em 0em 0em 1em;
  padding: 0.2em;
`;

const StyledToggleButton = styled(ToggleButton)`
  background-color: ${greenPrimary};
  margin: 0em 0.5em 1em 0em;
  padding: 0.2em 1em;
  font-size: 1em;
  box-shadow:0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
  &:hover {
    background-color: #11774e
  }
`
const StyledTabs = styled(Tabs)`
  background-color: ${greyPrimary};
  color: white;
  border-radius: 5px;
`;

//This is apart of the table view
function TabPanel({
  children,
  value,
  index,
  selectedDb,
  curDBType,
}: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
    >
      {value === index && children}
    </div>
  );
}

const rfStyle: object = {
  height: '65vh',
  border: `2px solid ${colors.greenPrimary}`,
  borderRadius: '0.3rem',
};

// defines the styling for the minimap
const mmStyle: object = {
  backgroundColor: colors.bgColor,
  border: `2px solid ${colors.greenPrimary}`,
  borderRadius: '0.3rem',
  height: 150,
  overflow: 'hidden',
};
// console.log(Node);
// defines the styling for the minimap nodes
const nodeColor = (node: Node): string => {
  switch (node.type) {
    case 'tableHeader':
      return colors.greyLightest;
    case 'tableField':
      return 'white';
    case 'tableFooter':
      return 'white';
    default:
      return 'red';
  }
};

type ERTablingProps = {
  tables: TableInfo[];
  selectedDb: AppState['selectedDb'];
  curDBType: DBType | undefined;
};

const a11yProps = (index: number) => ({
  id: `scrollable-auto-tab-${index}`,
  'aria-controls': `scrollable-auto-tabpanel-${index}`,
});

interface TablesTabBarProps {
  tables: TableInfo[];
  selectTable: (table: TableInfo) => void;
  selectedTable: TableInfo | undefined;
  selectedDb: AppState['selectedDb'];
  setERView?: (boolean: boolean) => void;
  curDBType: DBType | undefined;
}

interface HandleChangeFunc {
  (event: React.ChangeEvent<unknown>, newValue: number): void;
}

// interface ErViewProps {
//   active: boolean;
//   tables: TableInfo[];
//   selectedDb: AppState['selectedDb'];
//   curDBType: DBType | undefined;
//   tableIndex: number;
//   handleChange: HandleChangeFunc;
// }

// function ErView({
//   active,
//   tables,
//   selectedDb,
//   curDBType,
//   tableIndex,
// changes the state
//   handleChange,
// }: ErViewProps) {
//   console.log(selectedDb);
//   return (
//     <div>
// grabs the state
//       {active ? (
//         <ERTables
//           tables={tables}
//           selectedDb={selectedDb}
//           curDBType={curDBType}
//         />
//       ) : (
//         <>
//           <StyledTabs
//             value={tableIndex}
//             onChange={handleChange}
//             indicatorColor="primary"
//             variant="scrollable"
//             scrollButtons="auto"
//             aria-label="scrollable auto tabs example"
//           >
//             {tables.map(({ table_name: name }, index: number) => (
//               <Tab label={name} {...a11yProps(index)} key={name} />
//             ))}
//             ;
//           </StyledTabs>
//           <br />
//           <br />
//           {tables.map((tableMap, index) => (
//             <TabPanel
//               value={tableIndex}
//               index={index}
//               key={tableMap.table_name}
//               // curDBType={curDBType}
//               kevin={selectedDb}
//             >
//               <TableDetails table={tableMap} nguyen={selectedDb} />
//             </TabPanel>
//           ))}
//         </>
//       )}
//     </div>
//   );
// }

function TablesTabs({
  tables,
  selectTable,
  selectedTable,
  selectedDb,
  setERView,
  curDBType,
}: TablesTabBarProps & ERTablingProps) {

  //react flow functions to save layout
  interface FlowType {
    toObject(): any;
  }
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // state for custom controls toggle
  // when tables (which is the database that is selected changes, update SchemaState)
  const [schemaState, setSchemaState] = useState<SchemaStateObjType>({
    database: 'initial',
    tableList: [],
  });

  useEffect(() => {
    setSchemaState({ database: selectedDb, tableList: tables });
  }, [tables, selectedDb]);

  // define an object using the useRef hook to maintain its value throughout all rerenders
  // this object will hold the data that needs to get sent to the backend to update the
  // SQL database. Each node will have access to this backendObj
  const updates: UpdatesObjType = {
    addTables: [],
    dropTables: [],
    alterTables: [],
  };
  const backendObj = useRef({
    database: schemaState.database,
    updates,
  });

  // whenever the selectedDb changes, reassign the backendObj to contain this selectedDb
  useEffect(() => {
    backendObj.current.database = selectedDb;
  }, [selectedDb]);

  // whenever the node changes, this callback gets invoked
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  // whenever the edges changes, this callback gets invoked
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );

  // This function handles the add table button on the ER Diagram view
  const handleAddTable = (): void => {
    const schemaStateString = JSON.stringify(schemaState);
    const schemaStateCopy = JSON.parse(schemaStateString);
    // create an addTablesType object with AddTablesObjType
    const addTableObj: AddTablesObjType = {
      is_insertable_into: 'yes',
      table_name: `NewTable${schemaStateCopy.tableList.length + 1}`,
      table_schema: 'public',
      table_catalog: `${schemaStateCopy.database}`,
      columns: [],
    };
    // update the backendObj
    backendObj.current.updates.addTables.push(addTableObj);
    // push a new object with blank properties
    schemaStateCopy.tableList.push(addTableObj);
    // set the state, which worries about the table positions.
    setSchemaState(schemaStateCopy);
  };

  // This function is supposed to handle the layout saving of the positions of the tables.
  const handleSaveLayout = async (): Promise<void> => {
    // get the array of header nodes
    const headerNodes = nodes.filter(
      (node) => node.type === 'tableHeader',
    ) as TableHeaderNodeType[];
    // create object for the current database
      console.log('header nodes', headerNodes)

    type TablePosObjType = {
      id: string;
      table_position: {
        x: number;
        y: number;
      };
    };

    // just defines the type
    type DatabaseLayoutObjType = {
      db_name: string;
      db_tables: TablePosObjType[];
    };

    // initializes a variable using the type.
    const currDatabaseLayout: DatabaseLayoutObjType = {
      db_name: backendObj.current.database,
      db_tables: [],
    };

    // populate the db_tables property for the database
    headerNodes.forEach((node) => {
      const tablePosObj: TablePosObjType = {
        id: node.id,
        table_position: { x: node.position.x, y: node.position.y },
      };
      currDatabaseLayout.db_tables.push(tablePosObj);
    });
    console.log('currdblayout', currDatabaseLayout)


       // create an array of objects in local storage containing table info from currDatabaselayout
       const layoutFlowKey = 'layout-key';
    
       const existingLayouts: DatabaseLayoutObjType[] = JSON.parse(localStorage.getItem(layoutFlowKey) ?? '[]'); // ?? returns [] if null/notfound  (arr of objs) 
        
       // check if dbname in existinglayouts is equal to currdatabaylayout name (when new db is first initialized/not found, findIndex will return -1)
       const existingLayoutIndex = existingLayouts.findIndex((layout) => layout.db_name === currDatabaseLayout.db_name); 
       console.log('layoutindex', existingLayoutIndex)
         if (existingLayoutIndex !== -1) { 
           existingLayouts[existingLayoutIndex] = currDatabaseLayout; // if it exists, if so, updates to new postions
         } else {
           existingLayouts.push(currDatabaseLayout); // if not exists, pushes it to array
         }
       
       localStorage.setItem(layoutFlowKey, JSON.stringify(existingLayouts));
       console.log('nodes', nodes) 
       // current problem: doesnt remove deleted databases from existingLayouts value
   
  };

  // When you click the save button, you save the layout of the tables and you send a very large object to the backend containing all of the changes.
  function handleClickSave(): void {
    // This function sends a message to the back end with
    // the data in backendObj.current
    handleSaveLayout();
   
    ipcRenderer
      .invoke('ertable-schemaupdate', backendObj.current, selectedDb, curDBType)
      .then(async () => {
        // resets the backendObj
        backendObj.current = {
          database: schemaState.database,
          updates,
        };
      })
      .catch((err: object) => {
        console.log(err);
      });
  }

  // This useEffect fires when schemaState changes and will convert the state to a form react flow requires
  useEffect(() => {
    console.log(schemaState);
    console.log(stateToReactFlow);
    // send the schema state to the convert method to convert the schema to the form react flow requires
    const initialState = stateToReactFlow.convert(schemaState);
    console.log(initialState);
    // create a deep copy of the state, to ensure the state is not directly modified
    const schemaStateString = JSON.stringify(schemaState);
    const schemaStateCopy = JSON.parse(schemaStateString);
    // create a nodesArray with the initialState data
    const nodesArray = initialState.nodes.map((currentNode) => {
      // add the schemaStateCopy and setSchemaState to the nodes data so that each node
      // has reference to the current state and can modify the state to cause rerenders
      const { data } = currentNode;
      return {
        ...currentNode,
        data: {
          ...data,
          schemaStateCopy,
          setSchemaState,
          backendObj,
          handleClickSave,
        },
      };
    });
    setNodes(nodesArray);
    setEdges(initialState.edges);
  }, [schemaState]);

  const handleChange: HandleChangeFunc = (event, newValue) => {
    selectTable(tables[newValue]);
  };

  const tableIndex = tables.findIndex(
    ({ table_name }) => table_name === selectedTable?.table_name,
  );

  const [active, setActive] = useState(true);

  const handleView = (e, newActive: boolean | null) => {
    // force at least one selected view
    if (newActive !== null) {
      // set the new view to the currect view
      setActive(newActive);

      // disable the dummy data button when in ER View
      if (setERView) {
        if (active) setERView(newActive);
        else setERView(newActive);
      }
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 200px)', width: '100%'}}>

      <div style={{ marginBottom: '1em'}}>
        <StyledToggleButton
          value
          aria-label="er"
          className="tables-view-btn"
          title="ER Diagram"
          onChange={handleView}
        >
          ER diagram
          {/* <AccountTreeIcon sx={{ fontSize: 40 }} style={{ color: 'white' }} /> */}
        </StyledToggleButton>
        <StyledToggleButton
          value={false}
          aria-label="table"
          className="tables-view-btn"
          title="Table View"
          onChange={handleView}
        >
          Table View
          {/* <TableViewIcon sx={{ fontSize: 40 }} style={{ color: 'white' }} /> */}
        </StyledToggleButton>
      </div>

      {active ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesConnectable={false}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          // onInit={setRfInstance}
          zoomOnScroll
          minZoom={0.1}
          maxZoom={10}
          fitView
          style={rfStyle}
          onlyRenderVisibleElements={false}
        >
      <StyledViewButton
        variant="contained"
        id="add-table-btn"
        onClick={handleSaveLayout}
        title="Save Layout"
      >
        <AccountTreeIcon sx={{ fontSize: 40 }} style={{ color: 'white', zIndex: 999}} />
      </StyledViewButton>
      <StyledViewButton
        variant="contained"
        id="add-table-btn"
        onClick={handleAddTable}
        title="Add Table"
      >
        <PlaylistAddIcon sx={{ fontSize: 40 }} style={{ color: 'white', zIndex: 999}} />
      </StyledViewButton>
      <StyledViewButton
        variant="contained"
        id="save"
        onClick={handleClickSave}
        title="Save Database"
      >
        <SaveAsIcon sx={{ fontSize: 40 }} style={{ color: 'white', zIndex: 999 }} />
      </StyledViewButton>
          <MiniMap
            nodeColor={nodeColor}
            style={mmStyle}
            nodeStrokeWidth={3}
            pannable
            inversePan
          />
          <Background />
          <Controls />
        </ReactFlow>
      ) : (
        <>
          <StyledTabs
            value={tableIndex}
            onChange={handleChange}
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
          >
            {tables.map(({ table_name: name }, index: number) => (
              <Tab label={name} {...a11yProps(index)} key={name} />
            ))}
            ;
          </StyledTabs>
          <br />
          <br />
          {tables.map((tableMap, index) => (
            <TabPanel
              value={tableIndex}
              index={index}
              key={tableMap.table_name}
              curDBType={curDBType}
              selectedDb={selectedDb}
            >
              <TableDetails
                table={tableMap}
                selectedDb={selectedDb}
                curDBType={curDBType}
              />
            </TabPanel>
          ))}
        </>
      )}
    </div>
  );
}

export default TablesTabs;
