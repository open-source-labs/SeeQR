import { PlanNode, ExplainJson, Thresholds } from '../types';
import { planNodeWidth, planNodeHeight } from '../style-variables';
import createLayout, { SizedNode, Graph } from './planLayout';


export type SizedPlanNode = PlanNode & SizedNode;

export interface Totals {
  time: number;
}

/**
 * Convert dagree layout to react-flow elements
 */
const dagreToFlow = (
  graphElements: Graph<PlanNode>,
  totals: Totals,
  thresholds: Thresholds,
  nodeType: string,
  edgeType: string
) => {
  const nodes = graphElements.nodes.map((node) => ({
    id: node.id,
    // NOTE: BREAKS IF  CIRCULAR STRUCTURES ARE PASSED IN
    data: { plan: node.nodeData, totals, thresholds },
    position: { x: node.x, y: node.y },
    type: nodeType,
  }));

  const edges = graphElements.edges.map((edge) => ({
    id: `${edge.nodes.from}-${edge.nodes.to}`,
    source: edge.nodes.from,
    target: edge.nodes.to,
    type: edgeType,
    animated: true,
  }));
  console.log('nodes', nodes);
  console.log('edges', edges);
  return (
    {
      nodes,
      edges
    })

};

const traverse = (
  root: PlanNode,
  idGenerator: () => string,
  cb: (node: SizedNode) => void
) => {
  const node: SizedPlanNode = {
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
    const runId = Date.now().toString();
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
  explain: ExplainJson,
  thresholds: Thresholds,
  nodeComponent: string,
  edgeType: string
) => {
  const sizedNodes = getSizedNodes(explain.Plan);

  // values to be injected into each plan
  const totals: Totals = { time: explain['Execution Time'] };

  const layout = createLayout<PlanNode>(sizedNodes);

  const result = dagreToFlow(layout, totals, thresholds, nodeComponent, edgeType);
  console.log('result', result);
  return result;
};

export default buildFlowGraph;
