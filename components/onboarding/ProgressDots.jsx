import React from "react";
import { View } from "react-native";

const ProgressDots = ({ total, current }) => (
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={{
          width: i === current ? 28 : 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: i === current ? "#D6EBEB" : "#494358",
          marginRight: i < total - 1 ? 6 : 0,
        }}
      />
    ))}
  </View>
);

export default ProgressDots;
