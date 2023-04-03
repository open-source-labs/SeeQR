import fs from 'fs';
import { ipcRenderer, remote } from 'electron';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Node,
  Edge,
  MiniMap,
} from 'react-flow-renderer';
import { Button } from '@material-ui/core';
import styled from 'styled-components';
import stateToReactFlow from '../../../lib/convertStateToReactFlow';
import nodeTypes, { DatabaseLayoutObjType, TablePosObjType } from './NodeTypes';
import {
  UpdatesObjType,
  AddTablesObjType,
  TableHeaderNodeType,
  AppState,
  SchemaStateObjType,
  DBType,
} from '../../../types';

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
};

// defines the styling for the minimap nodes
const nodeColor = (node): string => {
  switch (node.type) {
    case 'tableHeader':
      return colors.greyLightest;
    case 'tableField':
      return 'white';
    default:
      return 'red';
  }
};

const StyledViewButton = styled(Button)`
  margin: 1rem;
  margin-left: 0rem;
  font-size: 0.78em;
  padding: 0.45em;
`;
type ERTablingProps = {
  tables;
  selectedDb: AppState['selectedDb'];
  curDBType: DBType | undefined;
};
function ERTabling({ tables, selectedDb, curDBType }: ERTablingProps) {
  const [schemaState, setSchemaState] = useState<SchemaStateObjType>({
    database: 'initial',
    tableList: [],
  });
  const [reactFlowCache, setReactFlowCache] = useState({});
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [rfInstance, setRfInstance] = useState(null);
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  // whenever the edges changes, this callback gets invoked
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  // state for custom controls toggle
  const updates: UpdatesObjType = {
    addTables: [],
    dropTables: [],
    alterTables: [],
  };
  const backendObj = useRef({
    database: schemaState.database,
    updates,
  });
  // when tables (which is the database that is selected changes, update SchemaState)
  useEffect(() => {
    setSchemaState({ database: selectedDb, tableList: tables });
    backendObj.current.database = selectedDb;
  }, [tables, selectedDb]);
  // define an object using the useRef hook to maintain its value throughout all rerenders
  // this object will hold the data that needs to get sent to the backend to update the
  // SQL database. Each node will have access to this backendObj

  // whenever the selectedDb changes, reassign the backendObj to contain this selectedDb

  // whenever the node changes, this callback gets invoked

  // const onSave = useCallback(() => {
  //   if (rfInstance) {
  //     const flow = rfInstance.toObject();
  //     const reactFlowCacheCopy = JSON.parse(JSON.stringify(reactFlowCache));
  //     reactFlowCacheCopy[selectedDb] = flow;
  //     setReactFlowCache(reactFlowCacheCopy);
  //   }
  // }, [rfInstance]);
  // const onRestore = useCallback(() => {
  //   const restoreFlow = async () => {
  //     const flow = reactFlowCache[selectedDb];
  //     // JSON.parse(localStorage.getItem(flowKey));

  //     if (flow) {
  //       setNodes(flow.nodes || []);
  //       setEdges(flow.edges || []);
  //     }
    };

  //   restoreFlow();
  // }, [setNodes]);
  const onInitHandler = useCallback(() => setRfInstance, [setRfInstance]);
  // This function handles the add table button on the ER Diagram view
  const handleAddTable = (): void => {
    const schemaStateCopy = JSON.parse(JSON.stringify(schemaState));
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

  const handleSaveLayout = (): void => {
    // get the array of header nodes
    const headerNodes = nodes.filter(
      (node) => node.type === 'tableHeader'
    ) as TableHeaderNodeType[];

    // create object for the current database

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

    const location: string = remote.app
      .getPath('home')
      .concat('/Documents/SeeQR/UserTableLayouts.json');
    const location2: string = remote.app
      .getPath('home')
      .concat('/Documents/SeeQR/SuperConsoleLog.json');
    fs.readFile(location, 'utf-8', (err, data) => {
      // check if error exists (no file found)
      if (err) {
        fs.writeFile(
          location,
          JSON.stringify([currDatabaseLayout], null, 2),
          (error) => {
            if (error) console.log(error);
          }
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
        fs.writeFile(location, JSON.stringify(dbLayouts, null, 2), (error) => {
          if (error) console.log(error);
        });
      }
    });
    const out: any = {
      backendObj,
      selectedDb,
      curDBType,
      nodes,
      edges,
    };
    fs.readFile(location2, 'utf-8', (err, data) => {
      // check if error exists (no file found)
      if (err) {
        fs.writeFile(location2, JSON.stringify(out, null, 2), (error) => {
          if (error) console.log(error);
        });

        // check if file exists
      } else {
        // write changes to the file
        fs.writeFile(location2, JSON.stringify(out, null, 2), (error) => {
          if (error) console.log(error);
        });
      }
    });
  };
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
    const schemaStateCopy = JSON.parse(JSON.stringify(schemaState));
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
      <StyledViewButton variant="contained" id="testSave" onClick={onSave}>
        {' '}
        testReactFlowSave{' '}
      </StyledViewButton>
      <StyledViewButton
        variant="contained"
        id="testRestore"
        onClick={onRestore}
      >
        {' '}
        testReactFlowRestore{' '}
      </StyledViewButton>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        panOnScroll
        minZoom={0.1}
        maxZoom={10}
        defaultPosition={[0, 0]}
        // fitView
        style={rfStyle}
        onlyRenderVisibleElements={false}
        onInit={onInitHandler}
      >
        <MiniMap nodeColor={nodeColor} style={mmStyle} nodeStrokeWidth={3} />
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default ERTabling;
