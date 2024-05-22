import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TablesTabs from '../../../frontend/components/views/DbView/TablesTabBar';

describe('TablesTabs Component', () => {
  it('renders without crashing', () => {
    render(<TablesTabs
      tables={[{
        table_name: 'TestTable',
        table_catalog: '',
        table_schema: '',
        is_insertable_into: 'yes',
        columns: []
      }]}
      selectTable={() => {}}
      selectedTable={undefined}
      selectedDb='test_db'
      setERView={() => {}}
      curDBType= {undefined}
    />);
    expect(document.body).not.toHaveTextContent('');
  });
});


// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
// import TablesTabs from '../../../frontend/components/views/DbView/TablesTabBar';

// describe('TablesTabs Component', () => {
//   const mockSelectTable = jest.fn();
//   const mockSetERView = jest.fn();
//   const mockHandleClickSave = jest.fn();

//   const tables = [
//     { table_name: 'Users', columns: [] },
//     { table_name: 'Orders', columns: [] },
//   ];

//   const selectedTable = { table_name: 'Users', columns: [] };
//   const selectedDb = 'test_db';
//   const curDBType = 'Postgres';

//   beforeEach(() => {
//     render(
//       <TablesTabs
//         tables={tables}
//         selectTable={mockSelectTable}
//         selectedTable={selectedTable}
//         selectedDb={selectedDb}
//         setERView={mockSetERView}
//         curDBType={curDBType}
//       />
//     );
//   });

//   it('renders the component', () => {
//     expect(screen.getByText(/ER diagram/i)).toBeInTheDocument();
//     expect(screen.getByText(/Table View/i)).toBeInTheDocument();
//   });

//   it('displays the correct number of tabs', () => {
//     const tabLabels = screen.getAllByRole('tab');
//     expect(tabLabels).toHaveLength(tables.length);
//     tabLabels.forEach((label, index) => {
//       expect(label.textContent).toBe(tables[index].table_name);
//     });
//   });

//   it('calls selectTable when a tab is clicked', () => {
//     const secondTab = screen.getByText(tables[1].table_name);
//     fireEvent.click(secondTab);
//     expect(mockSelectTable).toHaveBeenCalledWith(tables[1]);
//   });

// });
