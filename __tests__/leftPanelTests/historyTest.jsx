import * as React from "react";
import { History } from "../../frontend/components/leftPanel/History";
import { shallow } from "enzyme";

describe ("History feature tests", () => {
  // wrapper will be assigned the evaluation of the shallow render
  let wrapper;

  const props = {
    queries: [],
    currentSchema: '',

  }
  // shallow render the component before running tests
  beforeAll(() => {
    wrapper = shallow(<History {...props}/>)
  })

  it('Should render a div', () => {
    expect(wrapper.type()).toEqual('div');
  })

  it('Should render correct h3 element', () => {
    expect(wrapper.containsMatchingElement(
    <h3>History</h3>)).toBeTruthy();
  })

  it('Should render query label', () => {
    expect(wrapper.containsMatchingElement(
      <td>{'Query Label'}</td>)).toBeTruthy();
  })

})