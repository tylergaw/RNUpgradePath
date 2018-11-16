import App from "../App";
import React from "react";
import renderer from "react-test-renderer";

describe("App", () => {
  it("renders correctly", () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
