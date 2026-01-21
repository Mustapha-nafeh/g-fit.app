import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const GetStartedScreen = ({ currentPage = 4, totalPages = 4, isLastPage = true }) => {
  const handleBack = () => {
    router.back();
  };

  const handleGetStarted = async () => {
    try {
      // Check if user has access token stored
      const accessToken = await SecureStore.getItemAsync("access_token");

      if (accessToken) {
        // User is logged in, go to user selection
        router.push("/(selection)/select-app");
      } else {
        // User not logged in, go to auth welcome
        router.push("/(auth)/welcome");
      }
    } catch (error) {
      console.error("Error checking access token:", error);
      // If there's an error, default to welcome page
      router.push("/(auth)/welcome");
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View className="flex-1 px-6 bg-background">
        <Image source={require("../../assets/Ellipse1.png")} className=" absolute top-0 left-0" />

        {/* Content Container */}
        <View className="flex-1 justify-end px-2">
          {/* Page Indicators */}
          <View className="flex-row justify-start mb-12">
            {Array.from({ length: totalPages }).map((_, index) => (
              <View
                key={index}
                className={`h-1 rounded-full mr-2 ${
                  index === currentPage - 1 ? "bg-buttonPrimary w-8" : "bg-gray-600 w-2"
                }`}
              />
            ))}
          </View>

          {/* Main Content */}
          <View className="mb-16">
            <Text
              style={{ fontFamily: "MontserratAlternates_700Bold" }}
              className="text-white text-4xl leading-tight mb-6"
            >
              Change yourself{"\n"}Take the initiative
            </Text>

            <Text
              style={{ fontFamily: "MontserratAlternates_400Regular" }}
              className="text-gray-300 text-base leading-6"
            >
              An initiative for self-improvement refers to the proactive efforts and actions taken to enhance one's
              personal development and growth.
            </Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="pb-12">
          <TouchableOpacity
            onPress={handleGetStarted}
            className="w-full bg-buttonPrimary py-4 px-6 rounded-3xl active:bg-white"
          >
            <Text
              style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
              className="text-gray-800 text-center text-lg font-bold"
            >
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default GetStartedScreen;
