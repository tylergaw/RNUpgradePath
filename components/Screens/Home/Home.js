import { StyleSheet, View } from "react-native";

import { Button } from "Patterns";
import React from "react";

const Home = () => (
  <View style={styles.container}>
    <Button
      style={styles.button}
      title="henlo"
      onPress={() => console.log("Dogs are cool")}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  button: {
    borderWidth: 2,
    borderRadius: 6,
    borderColor: "#252525",
    padding: 10
  }
});

export default Home;
