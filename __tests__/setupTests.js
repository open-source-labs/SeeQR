import { configure } from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";

configure({ adapter: new React16Adapter() });

describe('Setup', () => {
  it('should run before all tests', () => {
    expect(true).toBe(true);
  })
})