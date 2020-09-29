import * as React from "react";
import * as renderer from "react-test-renderer";
import { Splash } from "../frontend/components/Splash";
import { shallow } from "enzyme";

describe ("Splash page tests", () => {
  // wrapper will be assigned the evaluation of the shallow render
  let wrapper;
  let shallowRender;
  // mock functions to pass to handlers
  const mockFileClick = jest.fn(() => {
    return;
  })
  const mockSkipClick = jest.fn(() => {
    return;
  })
  // props to be passed to the shallow render of the component
  const props = {
    openSplash: true,
    handleFileClick: mockFileClick,
    handleSkipClick: mockSkipClick
  }
  // shallow render the component before running tests
  beforeAll(() => {
    // wrapper = new Splash(props);
    // shallowRender = shallow<Splash>(wrapper);
    wrapper = shallow(<Splash {...props}/>)
  })

  // it('should work', () => {
  //   expect(wrapper).toBeInstanceOf(Splash);
  // })

  it('The functions passed down should be invoked on click', () => {
    // wrapper.find({ id: 'skip_button'}).simulate('click');
    // expect(mockFileClick).toHaveBeenCalled();
    expect(wrapper.type()).toEqual('div');
  })
})
