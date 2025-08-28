import React from "react";
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const OnboardingScreen = ({ currentPage = 3, totalPages = 4 }) => {
  const handleNext = () => {
    router.push(`/(onboarding)/get-started`);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View className="flex-1 px-6 bg-background">
        <Image source={require("../../assets/Ellipse1.png")} className=" absolute top-0 left-0" />

        {/* Content Container */}
        <View className="flex-1 justify-end px-2">
          {/* Page Indicators */}
          <View className="flex-row justify-start mb-8">
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
              Prove yourself{"\n"}That you can change
            </Text>

            <Text
              style={{ fontFamily: "MontserratAlternates_400Regular" }}
              className="text-gray-300 text-base leading-6"
            >
              Change acts as a dynamic force that pushes us toward personal development and progress. Embracing
              transformation means accepting.
            </Text>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-end items-center pb-12">
          {/* Back Button */}
          {/* <TouchableOpacity onPress={handleBack} className="flex-row items-center active:opacity-70">
            <View className="w-12 h-12 bg-gray-700/50 rounded-full justify-center items-center mr-3">
              <Ionicons name="chevron-back" size={20} color="white" />
            </View>
            <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-lg">
              Back
            </Text>
          </TouchableOpacity> */}

          {/* Next Button */}
          <TouchableOpacity onPress={handleNext} className="flex-row items-center active:opacity-70">
            <Text
              style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
              className="text-white text-lg mr-3 font-bold"
            >
              Next
            </Text>
            <View className="w-12 h-12 bg-buttonPrimary rounded-full justify-center items-center">
              <Ionicons name="chevron-forward" size={20} color="#374151" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default OnboardingScreen;
