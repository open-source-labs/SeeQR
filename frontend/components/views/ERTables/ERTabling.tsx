import * as path from 'path';
import fs from 'fs';
import { app, ipcRenderer, remote } from 'electron';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Node,
  Edge,
} from 'react-flow-renderer';
import { Button } from '@material-ui/core';
import styled from 'styled-components';
import stateToReactFlow from '../../../lib/convertStateToReactFlow';
import nodeTypes from './NodeTypes';
import {
  BackendObjType,
  UpdatesObjType,
  AddTablesObjType,
  TableHeaderNodeType
} from '../../../types';
import { sendFeedback } from '../../../lib/utils';
// import UserTableLayouts from '/UserTableLayouts.json';

// here is where we would update the styling of the page background
const rfStyle = {
  height: '100vh',
};

type ERTablingProps = {
  tables;
  selectedDb: AppState['selectedDb'];
};

const StyledViewButton = styled(Button)`
margin: 1rem;
margin-left: 0rem;
`;

function ERTabling({ tables, selectedDb }: ERTablingProps) {
  const [schemaState, setSchemaState] = useState<SchemaStateObjType>({database: 'initial', tableList: []});
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // when tables (which is the database that is selected changes, update SchemaState)
  useEffect(() => {
    setSchemaState({database: selectedDb, tableList: tables});
  }, [tables]);
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
  // when SchemaState changes, convert the schema to react flow
  useEffect(() => {
    const initialState = stateToReactFlow.convert(schemaState);
    // create a deep copy of the state, to ensure the state is not directly modified
    const schemaStateString = JSON.stringify(schemaState);
    const schemaStateCopy = JSON.parse(schemaStateString);
    // initialize the backendobj with the current database
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
        },
      };
    });
    setNodes(nodesArray);
    setEdges(initialState.edges);
  }, [schemaState]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleAddTable = () => {
    const schemaStateString = JSON.stringify(schemaState);
    const schemaStateCopy = JSON.parse(schemaStateString);

    // create an addColumnsType object
    const addTableObj: AddTablesObjType = {
      is_insertable_into: "yes",
      table_name: `NewTable${schemaStateCopy.tableList.length + 1}`,
      table_schema: `public`,
      table_catalog: `${schemaStateCopy.database}`,
      columns: []
    };

    // update the backendObj
    backendObj.current.updates.addTables.push(addTableObj);
    // push a new object with blank properties
    schemaStateCopy.tableList.push(addTableObj);
    // set the state
    setSchemaState(schemaStateCopy);

    // return;
  };

  const StyledViewButton = styled(Button)`
    margin: 1rem;
    margin-left: 0rem;
  `;

  const handleSaveLayout = () => {
    // get the array of header nodes
    const headerNodes = nodes.filter((node) => node.type === 'tableHeader') as TableHeaderNodeType[];

    // create object for the current database
    type TablePosObjType = {
      table_name: string,
      table_position: number[]
    }

    type DatabaseLayoutObjType = {
      db_name: string,
      db_tables: TablePosObjType[]
    }

    const currDatabaseLayout: DatabaseLayoutObjType = {
      db_name: backendObj.current.database,
      db_tables: [],
    };

    console.log(backendObj)
    // // populate the db_tables property for the database
    headerNodes.forEach(node => {
      const tablePosObj: TablePosObjType = {
        table_name: node.tableName,
        table_position: [node.position.x, node.position.y]
      };
      currDatabaseLayout.db_tables.push(tablePosObj)
    });


    const location = remote.app.getAppPath().concat('/UserTableLayouts.json');
    fs.readFile(location, 'utf-8', (err, data) => {
      // check if error exists (no file found)
      if (err) {
        fs.writeFile(
          location, 
          JSON.stringify([currDatabaseLayout], null, 2), 
          (error) => { if (error) console.log(error)});

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
        fs.writeFile(
          location, 
          JSON.stringify(dbLayouts, null, 2), 
          (error) => { if (error) console.log(error)});
      }
    });

    // // if file 'UserTableLayouts' exists
    // if (UserTableLayouts) {
    //   // iterate thru array of dbs
    //     for (let i = 0; i < UserTableLayouts.length; i++) {
    //     // if current db exists
    //     if (UserTableLayouts[i].db_name === currDatabaseLayout.db_name) {
    //       // set array[i] = currDatabaseLayout
    //       UserTableLayouts[i] = currDatabaseLayout
    //     } else {
    //       // push curr db layout to array
    //       UserTableLayouts.push(currDatabaseLayout);
    //     }
    //   }
    // } else {
    // // if file doesnt exist
    //   // create file w db array data and append currDataBaseLayout
    //   // fs.writeFileSync()
    // }




    // if there isnt a file, push in an object with info abt db

    // fs.writeFileSync( file, databaseLayouts, options );
    // // if there is a file
    //   // if user has a saved layout for that db
    //   // if user does NOT have a layout
  };

  const handleClickSave = () => {
    // #TODO: This function will send a message to the back end with
    // the data in backendObj.current
    ipcRenderer
      .invoke('ertable-schemaupdate', backendObj.current)
      .then((data) => {
        // resets the backendObj
        if (data === 'success') {
          backendObj.current = {
            database: schemaState.database,
            updates,
          };
        }
      })
      .catch(() =>
        sendFeedback({
          type: 'error',
          message: 'Query failed',
        })
      )
      .catch((err: object) => {
        console.log(err);
      });

    handleSaveLayout();
  };

  return (
    <div>
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
        onConnect={onConnect}
        fitView
        style={rfStyle}
        onlyRenderVisibleElements={false}
        // attributionPosition="top-right"
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default ERTabling;
