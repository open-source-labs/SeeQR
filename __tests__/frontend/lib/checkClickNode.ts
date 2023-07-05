import {cleanup, fireEvent, render} from '@testing-library/react';
import ClickedNodeDetail from '../../../frontend/components/views/EricBloom/detailOfClickedNode.js';


// Mock the ipcRenderer module and its invoke method
jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn(),
  },
}));

describe('ClickedNodeDetail', () => {
  test('should invoke runQueryBloom when a node is clicked', () => {
    const runQueryBloom = jest.fn();
    const returnedRows = [
      { id: 1, name: 'Node 1' },
      { id: 2, name: 'Node 2' },
    ];
    const selectedNode = 'Node 1';

    const { getByText } = render(
      <ClickedNodeDetail
        returnedRows={returnedRows}
        selectedNode={selectedNode}
        runQueryBloom={runQueryBloom}
      />
    );

    // Simulate a click event on the node
    fireEvent.click(getByText('Node 1'));

    // Assert that runQueryBloom is called with the correct node
    expect(runQueryBloom).toHaveBeenCalledWith({ id: 1, name: 'Node 1' });
  });
});
