// mock getKeys 
// mock getHeader
// mock getRowsData
import * as React from 'react';
import { mount, shallow } from 'enzyme';
import { Table } from '../../../../frontend/components/rightPanel/schemaChildren/dataChildren/DataTable';

// test that the table gets populated
  // the headers get written
    // need keys to 
  // the rows populate

const dummyRowData = [{"header0":"header0", "header1":"header1"}, {"header0":"input0", "header1":1}]

// still don't understand the structure of the data that's coming in

const dummyTableProps = {
  queries: [{
    queryString: "string",
    queryData: dummyRowData,
    queryStatistics: 7,
    querySchema: "string",
    queryLabel: "string"
  }]
};

describe('Testing the data table', () => {
  let wrapper;
  beforeAll(() => {
    wrapper = mount(<Table { ...dummyTableProps }/>);
  })

  it('should render Table headers', () => {
    expect(wrapper.find('#dataTableHead').type()).toBe('thead');
    expect(wrapper.find('#dataTableHead').childAt(0).childAt(0).text()).toBe('HEADER0');
    expect(wrapper.find('#dataTableHead').childAt(0).childAt(1).text()).toBe('HEADER1');
  })

  it('should render Table data', () => {
    expect(wrapper.find('#dataTableBody').type()).toBe('tbody');
    expect(wrapper.find('#dataTableBody').childAt(0).childAt(0).text()).toBe('input0');
    expect(wrapper.find('#dataTableBody').childAt(0).childAt(1).text()).toBe('1');
  })
})

