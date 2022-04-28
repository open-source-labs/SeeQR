import tableHeader from './TableHeaderNode';
import tableField from './TableFieldNode';
/**
 * This file is required for React-flow
 * React-flow states:
 *  " You can add a new node type to React Flow by adding it to the nodeTypes prop.
 *  It's important that the nodeTypes are memoized or defined outside of the component. 
 *  Otherwise React creates a new object on every render which leads to performance issues and bugs."
 * 
 *  https://reactflow.dev/docs/guides/custom-nodes/
 * 
 */
type NodeTypes = {
  tableHeader: any
  tableField: any
}
const nodeTypes: NodeTypes = {
  tableHeader,
  tableField
}

export default nodeTypes;