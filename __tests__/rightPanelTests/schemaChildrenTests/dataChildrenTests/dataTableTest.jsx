import * as React from 'react';
import { mount, shallow } from 'enzyme';
import { Table } from '../../../../frontend/components/rightPanel/schemaChildren/dataChildren/DataTable';

const dummyRowData = [{"header0":"input0", "header1":1}]

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

  it('should render data Table body element', () => {
    expect(wrapper.find('#dataTableBody').type()).toBe('tbody');
  })
})

