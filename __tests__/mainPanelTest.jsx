import * as React from "react";
import { MainPanel } from "../frontend/components/MainPanel";
import { shallow } from "enzyme";

const dummyState = {
    queries: [{
      queryString: 'queryString',
      queryData: [{'key1': 'value1'}, {'key2': 'value2'}],
      queryStatistics: [4, "string"],
      querySchema: "schemaString",
      queryLabel: "labelString",
    }],
    currentSchema: "currentSchemaString",
    lists: ["peanut", "butter"]
  };

  const mainProps = {"keyProp": "valueProp"}

  describe ("MainPanel page tests", () => {
    let wrapper;
    // shallow render the component before running tests
    beforeAll(() => {
      wrapper = shallow(<MainPanel />)
    });
  
    it('Should shallow render the component', () => {
        expect(wrapper.type()).toBe("MainPanel")
    });
  });
  