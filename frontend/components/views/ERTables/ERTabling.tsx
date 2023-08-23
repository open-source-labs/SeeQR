import fs from 'fs';
import { Button } from '@mui/material';
import { ipcRenderer } from 'electron';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { DBType } from '../../../../backend/BE_types';
import stateToReactFlow from '../../../lib/convertStateToReactFlow';
import {
  AddTablesObjType,
  AppState,
  SchemaStateObjType,
  TableHeaderNodeType,
  TableInfo,
  UpdatesObjType,
} from '../../../types';
import nodeTypes from './NodeTypes';

import * as colors from '../../../style-variables';

// defines the styling for the ERDiagram window
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

// defines the styling for the minimap nodes
const nodeColor = (node: Node): string => {
  switch (node.type) {
    case 'tableHeader':
      return colors.greyLightest;
    case 'tableField':
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

const StyledViewButton = styled(Button)`
  margin: 1rem;
  margin-left: 0rem;
  font-size: 0.78em;
  padding: 0.45em;
`;

// the ERTabling componenet is what deals with the ER Diagram view and it's positioning. All of this gets converted to react flow, as for the backendObj, this is what gets sent to the backend to run all the queries.
function ERTabling({ tables, selectedDb, curDBType }: ERTablingProps) {
  const [schemaState, setSchemaState] = useState<SchemaStateObjType>({
    database: 'initial',
    tableList: [],
  });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // state for custom controls toggle
  // when tables (which is the database that is selected changes, update SchemaState)
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

    type TablePosObjType = {
      table_name: string;
      table_position: {
        x: number;
        y: number;
      };
    };

    type DatabaseLayoutObjType = {
      db_name: string;
      db_tables: TablePosObjType[];
    };

    const currDatabaseLayout: DatabaseLayoutObjType = {
      db_name: backendObj.current.database,
      db_tables: [],
    };

    // populate the db_tables property for the database
    headerNodes.forEach((node) => {
      const tablePosObj: TablePosObjType = {
        table_name: node.tableName,
        table_position: { x: node.position.x, y: node.position.y },
      };
      currDatabaseLayout.db_tables.push(tablePosObj);
    });

    // what this is doing is it's creating a json file in your temp folder and saving the layout of the tables in there. so positioning is all saved locally.
    const location: string = await ipcRenderer.invoke('get-path', 'temp');
    const filePath = location.concat('/UserTableLayouts.json');

    fs.readFile(filePath, 'utf-8', (err, data) => {
      // check if error exists (no file found)
      if (err) {
        fs.writeFile(
          filePath,
          JSON.stringify([currDatabaseLayout], null, 2),
          (error) => {
            if (error) console.log(error);
          },
        );
        // check if file exists
      } else {
        const dbLayouts = JSON.parse(data) as DatabaseLayoutObjType[];
        let dbExists = false;
        // if db has saved layout settings overwrite them
        dbLayouts.forEach((db, i) => {
          if (db.db_name === currDatabaseLayout.db_name) {
            dbLayouts[i] = currDatabaseLayout;
            dbExists = true;
          }
        });
        // if db has no saved layout settings add to file
        if (!dbExists) dbLayouts.push(currDatabaseLayout);

        // write changes to the file
        fs.writeFile(filePath, JSON.stringify(dbLayouts, null, 2), (error) => {
          if (error) console.log(error);
        });
      }
    });
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
    // send the schema state to the convert method to convert the schema to the form react flow requires
    const initialState = stateToReactFlow.convert(schemaState);
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

  return (
    <div style={{ height: 'calc(100vh - 300px)', width: '100%' }}>
      <StyledViewButton
        variant="contained"
        id="add-table-btn"
        onClick={handleAddTable}
      >
        {' '}
        Add New Table{' '}
      </StyledViewButton>
      <StyledViewButton variant="contained" id="save" onClick={handleClickSave}>
        {' '}
        Save{' '}
      </StyledViewButton>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        zoomOnScroll
        minZoom={0.1}
        maxZoom={10}
        fitView
        style={rfStyle}
        onlyRenderVisibleElements={false}
      >
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
    </div>
  );
}

export default ERTabling;
