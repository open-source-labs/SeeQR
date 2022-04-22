import { ipcRenderer } from 'electron';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
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
  UpdatesObjType,
  AddTablesObjType,
  AppState,
  SchemaStateObjType,
} from '../../../types';


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
  const [schemaState, setSchemaState] = useState<SchemaStateObjType>({
    database: 'initial',
    tableList: [],
  });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // when tables (which is the database that is selected changes, update SchemaState)
  useEffect(() => {
    setSchemaState({ database: selectedDb, tableList: tables });
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

  const backendColumnObj = useRef({
    database: schemaState.database,
    updates,
  });
  // whenever the selectedDb changes, reassign the backendObj to contain this selectedDb
  useEffect(() => {
    backendObj.current.database = selectedDb;
    backendColumnObj.current.database = selectedDb;
  }, [selectedDb]);

  // This function sends a messsage to the back end with the backendObj to specify what changes to the
  // database neeeds to be made
  const handleClickSave = () => {
    ipcRenderer
      .invoke('ertable-schemaupdate', backendObj.current)
      .then(() => {
        // resets the backendObj
        backendObj.current = {
          database: schemaState.database,
          updates,
        };
      })
      .catch((err: object) => {
        // console.log here to notify developers that there was an error messaging the main process
        console.log(err);
      });
  };

  // This useEffect fires when schemaState changes and will convert the state to a form react flow requires
  useEffect(() => {
    // send the schema state to the convert method to convert the schema to the form react flow requires
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
          handleClickSave
        },
      };
    });
    setNodes(nodesArray);
    setEdges(initialState.edges);
  }, [schemaState]);
  
  // whenever the node changes, this callback gets invoked
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  // whenever the edges changes, this callback gets invoked
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // This function handles the add table button on the ER Diagram view
  const handleAddTable = () => {
    const schemaStateString = JSON.stringify(schemaState);
    const schemaStateCopy = JSON.parse(schemaStateString);
    // create an addTablesType object with AddTablesObjType
    const addTableObj: AddTablesObjType = {
      is_insertable_into: 'yes',
      table_name: `NewTable${schemaStateCopy.tableList.length + 1}`,
      table_schema: `public`,
      table_catalog: `${schemaStateCopy.database}`,
      columns: [],
    };
    // update the backendObj
    backendObj.current.updates.addTables.push(addTableObj);
    // push a new object with blank properties
    schemaStateCopy.tableList.push(addTableObj);
    // set the state
    setSchemaState(schemaStateCopy);
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
        // onConnect={onConnect}
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
