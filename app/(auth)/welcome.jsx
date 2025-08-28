import React from "react";
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { router } from "expo-router";

const Welcome = () => {
  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleRegister = () => {
    router.push("/(auth)/register");
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View className="flex-1 bg-background justify-center items-center px-6">
        <Image source={require("../../assets/Ellipse1.png")} className=" absolute top-0 left-0" />
        {/* Footprint Icon */}
        <View className="mb-16">
          <View className="w-20 h-20 rounded-full border-2 border-gray-400 justify-center items-center">
            <Ionicons name="footsteps" size={32} color="white" />
          </View>
        </View>

        {/* Title */}
        <View className="items-center mb-20">
          <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-4xl font-bold mb-2">
            Start your
          </Text>
          <View className="flex flex-row justify-center gap-2">
            <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-textYellow text-4xl font-bold">
              Fitness
            </Text>
            <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-4xl font-bold">
              Journey
            </Text>
          </View>
        </View>

        {/* Buttons Container */}
        <View className="w-full max-w-sm">
          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="w-full bg-buttonSecondary py-4 px-6 rounded-full mb-4 active:bg-gray-600"
          >
            <Text
              style={{ fontFamily: "MontserratAlternates_700Bold" }}
              className="text-white font-semibold text-center text-lg"
            >
              Login
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            className="w-full bg-buttonPrimary py-4 px-6 rounded-full mb-4 active:bg-white"
          >
            <Text
              style={{ fontFamily: "MontserratAlternates_700Bold" }}
              className="text-gray-800 font-semibold text-center text-lg"
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Welcome;
