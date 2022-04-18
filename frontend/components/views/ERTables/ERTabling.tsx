import fs from 'fs';
import { ipcRenderer } from 'electron';
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
} from '../../../types';
import { sendFeedback } from '../../../lib/utils';

// here is where we would update the styling of the page background
const rfStyle = {
  height: '100vh',
};

type ERTablingProps = {
  tables;
};

function ERTabling({ tables }: ERTablingProps) {
  const [schemaState, setSchemaState] = useState([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // when tables (which is the database that is selected changes, update SchemaState)
  useEffect(() => {
    setSchemaState(tables);
  }, [tables]);
  // define an object using the useRef hook to maintain its value throughout all rerenders
  // this object will hold the data that needs to get sent to the backend to update the
  // SQL database. Each node will have access to this backendObj
  const updates: UpdatesObjType = {
    addTables: [],
    dropTables: [],
    alterTables: [],
  };
  const backendObj = useRef<BackendObjType>({
    database: tables[0] ? tables[0].table_catalog : null,
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
          backendObj: backendObj.current,
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
      is_insertable_into: 'YES',
      table_name: `NewTable${schemaStateCopy.length + 1}`,
      table_schema: `${schemaStateCopy[0].table_schema}`,
      table_catalog: `${schemaStateCopy[0].table_catalog}`,
      columns: [],
    };

    // update the backendObj
    backendObj.current.updates.addTables.push(addTableObj);
    // push a new object with blank properties
    schemaStateCopy.push(addTableObj);
    // set the state
    setSchemaState(schemaStateCopy);

    return;
  };

  const StyledViewButton = styled(Button)`
    margin: 1rem;
    margin-left: 0rem;
  `;

  const handleSaveLayout = () => {
    // get the array of header nodes
    const headerNodes = nodes.filter((node) => node.type === 'tableHeader');

    // create object for the current database
    const databaseLayoutObj = {
      db_name: backendObj.current.database,
      db_tables: [],
    };

    // populate the db_tables property for the database
    headerNodes.forEach(node => {
      const tablePosObj = {
        table_name: node.tableName,
        table_position: [node.position.x, node.position.y]
      };
      databaseLayoutObj.db_tables.push(tablePosObj)
    });



    // if there isnt a file, push in an oblect with info abt db

    //     }
    //   ]
    // }]`;
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
            database: tables[0] ? tables[0].table_catalog : null,
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