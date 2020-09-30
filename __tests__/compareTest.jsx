import * as React from "react";
import * as renderer from "react-test-renderer";
import { Compare } from "../frontend/components/leftPanel/Compare";
import { shallow } from "enzyme";
import { stringify } from "querystring";

describe ("Comparison feature tests", () => {
  // wrapper will be assigned the evaluation of the shallow render
  let wrapper;

  const props = {
    queries: [],
    currentSchema: '',

  }
  // shallow render the component before running tests
  beforeAll(() => {
    wrapper = shallow(<Compare {...props}/>)
  })

  it('Should render a div', () => {
    expect(wrapper.type()).toEqual('div');
  })

  it('Should render h3 tag', () => {
    expect(wrapper.containsMatchingElement(
    <h3>Comparisons</h3>)).toBeTruthy();
  })

  it('Should render query label', () => {
    expect(wrapper.containsMatchingElement(
      <td>{'Query Label'}</td>)).toBeTruthy();
  })

})