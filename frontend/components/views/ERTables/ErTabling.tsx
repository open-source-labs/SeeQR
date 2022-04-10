import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
} from 'react-flow-renderer';

// CURRENTLY ACTING AS INITIAL STATE
// import initialState from './nodes/initial-state/mockState.js';


// import node types
// import tableHeader from './nodes/components/tableHeaderNode.js';
// import tableField from './nodes/components/tableFieldNode.js';

const nodeTypes = {
  tableHeader,
  tableField
}

// here is where we would update the styling of the page background
const rfStyle = {
  backgroundColor: '#D0C0F7',
};

function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
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

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      // style={rfStyle}
      // attributionPosition="top-right"
      >
      <button id='add-table-btn'> Add New Table </button>
      <Background />
    </ReactFlow>
  );
}

export default Flow;