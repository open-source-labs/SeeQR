import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Node,
  Edge
} from 'react-flow-renderer';
import stateToReactFlow from '../../../lib/convertStateToReactFlow';

// CURRENTLY ACTING AS INITIAL STATE
// import node types
import tableHeader from './TableHeaderNode';
import tableField from './TableFieldNode';

// TODO: Assign types to tableHeader and TableField
type NodeTypes = {
  tableHeader: any
  tableField: any
}

const nodeTypes: NodeTypes = {
  tableHeader,
  tableField
}

// here is where we would update the styling of the page background
const rfStyle = {
  height: '100vh',
};

type ERTablingProps = {
  tables 
}

function ERTabling({tables} : ERTablingProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  useEffect(() => {
    const initialState = stateToReactFlow.convert(tables); 
    setNodes(initialState.nodes);
    setEdges(initialState.edges);
  }, [tables])

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
      style={rfStyle}
      // attributionPosition="top-right"
      >
      <button id='add-table-btn'> Add New Table </button>
      <Background />
    </ReactFlow>
  );
}

export default ERTabling;