import { Text, TouchableOpacity } from "react-native";

import React from "react";

const Button = ({ onPress, title, accessibilityLabel, style }) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityLabel={accessibilityLabel}
    style={style}
  >
    <Text>{title}</Text>
  </TouchableOpacity>
);

export default Button;
