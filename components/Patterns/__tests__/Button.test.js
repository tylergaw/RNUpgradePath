import Button from "../Button";
import React from "react";
import renderer from "react-test-renderer";

describe("Button", () => {
  it("renders correctly with props", () => {
    const tree = renderer
      .create(
        <Button
          onPress={() => console.log("hello")}
          title="Do this"
          accessibilityLabel="Tell screen readers more here"
          style={{ backgroundColor: "red" }}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
