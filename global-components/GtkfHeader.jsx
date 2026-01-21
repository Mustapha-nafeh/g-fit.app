import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const GtkfHeader = ({ title, currentTab = "workouts" }) => {
  const handleBackToAppSelection = async () => {
    try {
      // Clear stored user data to force app selection
      await SecureStore.deleteItemAsync("token_key");
      await SecureStore.deleteItemAsync("member");
      await SecureStore.deleteItemAsync("selectedApp");

      // Navigate back to app selection
      router.replace("/(selection)/select-app");
    } catch (error) {
      console.log("Error clearing stored data:", error);
      router.replace("/(selection)/select-app");
    }
  };

  const handleTabPress = (tab) => {
    if (tab === "workouts") {
      router.replace("/(gtkf)/workouts");
    } else if (tab === "articles") {
      router.replace("/(gtkf)/articles");
    }
  };

  return (
    <View className="bg-background">
      {/* Top Header with Back Button */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <TouchableOpacity onPress={handleBackToAppSelection} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-sm ml-1">
            Apps
          </Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View className="px-6 pb-4">
        <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-2xl">
          {title}
        </Text>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row px-6 pb-4">
        <TouchableOpacity
          onPress={() => handleTabPress("workouts")}
          className={`flex-1 py-3 mr-2 rounded-full ${
            currentTab === "workouts" ? "bg-white" : "bg-transparent border border-white/30"
          }`}
        >
          <Text
            style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
            className={`text-center ${currentTab === "workouts" ? "text-gray-800" : "text-white"}`}
          >
            Workouts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTabPress("articles")}
          className={`flex-1 py-3 ml-2 rounded-full ${
            currentTab === "articles" ? "bg-white" : "bg-transparent border border-white/30"
          }`}
        >
          <Text
            style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
            className={`text-center ${currentTab === "articles" ? "text-gray-800" : "text-white"}`}
          >
            Articles
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GtkfHeader;
