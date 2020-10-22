import * as React from 'react';
import { shallow } from 'enzyme';
import { Data } from '../../../frontend/components/rightPanel/schemaChildren/Data';


const dummyTableProps = {
  queries: [{
    queryString: "string",
    queryData: [{}],
    queryStatistics: 7,
    querySchema: "string",
    queryLabel: "string"
  }]
};

describe ("Data tests", () => {
  const { queries } = dummyTableProps;
  
  // shallow render the component before running tests
  let wrapper;
  beforeAll(() => {
      wrapper = shallow(<Data { ...dummyTableProps } />)
  })

  it('Should render a div', () => {
      expect(wrapper.type()).toEqual('div');
  })

  it('Should render h3 tag', () => {
      expect(wrapper.containsMatchingElement(
      <h3 id="results-title">Data Table</h3>)).toBeTruthy();
  })

  it('Should render div to contain the data table', () => {
      expect(wrapper.find('#data-table').type()).toBe('div');
  })
})
