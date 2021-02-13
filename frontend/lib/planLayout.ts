import dagre from 'dagre';

interface GraphNode<T = any> {
  nodeData: T;
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface GraphEdge {
  nodes: {
    from: string;
    to: string;
  };
  points: { x: number; y: number }[];
}

export interface Graph<T> {
  nodes: GraphNode<T>[];
  edges: GraphEdge[];
  // graph: { height: number; width: number };
}

export interface SizedNode {
  id: string;
  width: number;
  height: number;
  children?: SizedNode[];
}

/**
 * Calculates layout from array of SizedNodes.
 * returns nodes, edges and graph information
 */
const createLayout = <T>(nodes: SizedNode[]): Graph<T> => {
  // Create a new directed graph
  const g = new dagre.graphlib.Graph();

  // Set an object for the graph label
  // for horizontal graph, rankdir: 'LR'
  g.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 100, edgesep: 100 });

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, {
      nodeData: node,
      id: node.id,
      width: node.width,
      height: node.height,
    });
    node.children?.forEach((child) => {
      g.setEdge(node.id, child.id);
    });
  });

  dagre.layout(g);

  return {
    nodes: g.nodes().map((node) => g.node(node)),
    edges: g.edges().map((edge) => ({
      ...g.edge(edge),
      nodes: { from: edge.v, to: edge.w },
    })),
    // asserting number types since we ran dagre.layout(g) so these are guaranteed not to be undefined
    // graph: {
    //   height: g.graph().height as number,
    //   width: g.graph().width as number,
    // },
  };
};

export default createLayout;
