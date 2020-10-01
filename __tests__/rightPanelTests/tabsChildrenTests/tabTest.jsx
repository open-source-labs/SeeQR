import * as React from 'react';
import { shallow } from 'enzyme';
import { Tab } from '../../../frontend/components/rightPanel/tabsChildren/Tab';

const dummyTabProps = {
    onClickTabItem: 'string',
    currentSchema: "string",
    label: "string",
};

describe ("Tab tests", () => {
    // shallow render the component before running tests
    let wrapper;
    beforeAll(() => {
        wrapper = shallow(<Tab { ...dummyTabProps } />)
    })
  
    it('Should render a list item', () => {
        expect(wrapper.type()).toEqual('li');
    })
})
