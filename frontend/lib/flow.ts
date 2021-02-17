import { Elements } from 'react-flow-renderer';
import { PlanNode } from '../types';
import { planNodeWidth, planNodeHeight } from '../style-variables';
import createLayout, { SizedNode, Graph } from './planLayout';

export type TypedElements = Elements<{
  plan: PlanNode;
}>;

export type SizedPlanNode = PlanNode & SizedNode

/**
 * Convert dagree layout to react-flow elements
 */
const dagreToFlow = (
  graphElements: Graph<PlanNode>,
  nodeType: string,
  edgeType: string
): TypedElements => {
  const nodes: TypedElements = graphElements.nodes.map((node) => ({
    id: node.id,
    // NOTE: BREAKS IF  CIRCULAR STRUCTURES ARE PASSED IN
    data: { plan: node.nodeData },
    position: { x: node.x, y: node.y },
    type: nodeType,
  }));

  const edges: TypedElements = graphElements.edges.map((edge) => ({
    id: `${edge.nodes.from}-${edge.nodes.to}`,
    source: edge.nodes.from,
    target: edge.nodes.to,
    type: edgeType,
    animated: true,
  }));

  return nodes.concat(edges);
};

const traverse = (
  root: PlanNode,
  idGenerator: () => string,
  cb: (node: SizedNode) => void
) => {
  const node: SizedNode = {
    ...root,
    id: idGenerator(),
    width: parseInt(planNodeWidth, 10),
    height: parseInt(planNodeHeight, 10),
  };
  node.children = root.Plans?.map((child) => traverse(child, idGenerator, cb));

  cb(node);
  return node;
};

/**
 * Flatten node tree and inject id and card sizes into each node
 */
const getSizedNodes = (root: PlanNode) => {
  /**
   * Build id from timestamp of this calculation and sequence that starts at 0
   * id is later used for memoizing renders of PlanCards so they must always be unique 
   * to different results, but consistent across renders of the same results
   * Declared here so ids always start at 0 for every traversal
   */
  const idGen = (() => {
    let counter = -1;
    const runId = Date.now().toString()
    return () => {
      counter += 1;
      return `${runId}_${counter}`;
    };
  })();

  const nodes: SizedNode[] = [];
  traverse(root, idGen, (node: SizedNode) => nodes.push(node));
  return nodes;
};

/**
 * Builds an array of React-Flow elements from a tree of PlanNodes
 * Uses planNodeWidth and planNodeHeight values from style-variables for the calculation
 * of each node's size in the graph in the layout
 */
const buildFlowGraph = (
  root: PlanNode,
  nodeComponent: string,
  edgeType: string
): TypedElements => {
  const sizedNodes = getSizedNodes(root);

  const layout = createLayout<PlanNode>(sizedNodes);
  return dagreToFlow(layout, nodeComponent, edgeType);
};

export default buildFlowGraph;
