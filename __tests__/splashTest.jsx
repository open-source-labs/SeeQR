import * as React from "react";
import { Splash } from "../frontend/components/Splash";
import { shallow } from "enzyme";

describe ("Splash page tests", () => {
  // mock functions to pass to handlers
  const mockFileClick = jest.fn(() => console.log("click"));
  const mockSkipClick = jest.fn(() => console.log("skipClick"));
  // props to be passed to the shallow render of the component
  const props = {
    openSplash: true,
    handleSkipClick: mockSkipClick,
    handleFileClick: mockFileClick
  };

  let wrapper;
  // shallow render the component before running tests
  beforeAll(() => {
    wrapper = shallow(<Splash {...props}/>)
  });

  it('should find the correct elements by id', () => {
    expect(wrapper.find('#skip_button').type()).toBe('button');
    expect(wrapper.find('#yes_button').type()).toBe('button');
  });

  it('The functions passed down should be invoked on click', () => {
    // testing the skip button
    wrapper.find('#skip_button').simulate('click');
    expect(mockSkipClick).toHaveBeenCalled();
    // testing the import button
    wrapper.find('#yes_button').simulate('click');
    expect(mockFileClick).toHaveBeenCalled();
  });
});
