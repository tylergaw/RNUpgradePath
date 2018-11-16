import React, { PureComponent } from "react";
import { Home } from "Screens";

class App extends PureComponent {
  doWork = () => {
    console.log(
      "This doesn't do anything. Writing this function to make sure fat arrow class methods work."
    );
  };

  render() {
    return <Home />;
  }
}

export default App;
