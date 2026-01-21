import React, { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const AppSelectionScreen = () => {
  const [selectedApp, setSelectedApp] = useState(null);

  const handleBack = () => {
    console.log("Back pressed");
  };

  const handleAppSelect = (appType) => {
    setSelectedApp(appType);
  };

  const handleGetStarted = () => {
    if (!selectedApp) return;
    router.push({ pathname: "(selection)/select-user", params: { selectedApp: selectedApp } });
  };

  const handleVisitAsGuest = () => {
    if (!selectedApp) return;

    // Navigate directly to the app without user selection for guest mode
    let route = "/(gfit)/home"; // Default fallback

    switch (selectedApp) {
      case "gfit":
        route = "/(gfit)/home";
        break;
      case "gtkf":
        route = "/(gtkf)/workouts";
        break;
      case "adults":
        route = "/(adults)/home"; // Assuming this exists
        break;
      default:
        route = "/(gfit)/home"; // Default fallback
        break;
    }

    router.replace(route);
  };

  const appOptions = [
    {
      id: "gfit",
      title: "G-Fit",
      subtitle: "Steps counter",
      icon: "footsteps",
      backgroundColor: "bg-gray-600",
    },
    {
      id: "adults",
      title: "Adults kit",
      subtitle: "Best for adults",
      backgroundColor: "bg-gray-300",
      placeholder: "ADULT",
    },
    {
      id: "gtkf",
      title: "Kids Kit",
      subtitle: "Best for kids",
      backgroundColor: "bg-gray-300",
      placeholder: "KIDS",
      image: require("../../assets/getthekidsfit.png"),
    },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View className="flex-1   bg-background px-6 pt-20">
        {/* Header with Back Button */}
        {/* <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 rounded-2xl border border-gray-400 justify-center items-center"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View> */}

        {/* Title Section */}
        <View className="mb-12">
          <Text
            style={{ fontFamily: "MontserratAlternates_700Bold" }}
            className="text-white text-4xl leading-tight mb-4"
          >
            Start your{"\n"}Fitness Journey
          </Text>
          <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-2xl">
            Please choose{"\n"}your app!
          </Text>
        </View>

        {/* App Options */}
        <View className="flex-1 mb-8">
          {appOptions.map((app, index) => (
            <TouchableOpacity
              key={app.id}
              onPress={() => handleAppSelect(app.id)}
              className={`flex-row items-center p-4 rounded-2xl mb-4 ${
                selectedApp === app.id ? "bg-gray-600" : "bg-gray-700/30"
              }`}
              activeOpacity={0.7}
            >
              {/* App Icon/Placeholder */}
              <View className={`w-16 h-16 rounded-2xl justify-center items-center mr-4 ${app.backgroundColor}`}>
                {app.icon || app.image ? (
                  app.image ? (
                    <Image source={app.image} className="w-12 h-12" style={{ resizeMode: "contain" }} />
                  ) : (
                    <View className="w-12 h-12 rounded-full border-2 border-gray-400 justify-center items-center">
                      <Ionicons name={app.icon} size={20} color="white" />
                    </View>
                  )
                ) : (
                  <View className="justify-center items-center">
                    <Text
                      style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                      className="text-gray-800 text-xs text-center"
                    >
                      {app.placeholder}
                    </Text>
                  </View>
                )}
              </View>

              {/* App Info */}
              <View className="flex-1">
                <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-lg mb-1">
                  {app.title}
                </Text>
                <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-300 text-sm">
                  {app.subtitle}
                </Text>
              </View>

              {/* Selection Indicator */}
              {selectedApp === app.id && (
                <View className="w-6 h-6 bg-yellow-300 rounded-full justify-center items-center">
                  <Ionicons name="checkmark" size={16} color="#374151" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          onPress={handleGetStarted}
          className={`w-full py-3 px-6 rounded-2xl mb-8 ${selectedApp ? "bg-gray-200 active:bg-white" : "bg-gray-600"}`}
          disabled={!selectedApp}
        >
          <Text
            style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
            className={`text-center text-lg ${selectedApp ? "text-gray-800" : "text-gray-400"}`}
          >
            Get Started
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={handleVisitAsGuest}
          className={`w-full py-3 px-6 rounded-2xl  ${
            selectedApp ? "bg-buttonSecondary" : "bg-gray-600"
          } border-white`}
          disabled={!selectedApp}
        >
          <Text
            style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
            className={`text-center text-lg ${selectedApp ? "text-white" : "text-gray-400"}`}
          >
            Visit as a guest
          </Text>
        </TouchableOpacity> */}
      </View>
    </>
  );
};

export default AppSelectionScreen;
