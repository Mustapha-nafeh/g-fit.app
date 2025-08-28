import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useGlobalContext } from "../../context/GlobalContext";

export default function FitnessDashboard() {
  const [currentDate, setCurrentDate] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("Steps");
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const { member } = useGlobalContext();

  //get family steps api
  //get member steps api, plus history (steps per day for last 7 days)
  //post member steps api
  //get challenges api
  //get leaderboard api - weekly, monthly, all time - global, friends, family - by challenge

  useEffect(() => {
    // Get current Date
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    );
  }, []);

  const challenges = [
    {
      id: 1,
      title: "Moustafa",
      subtitle: "Get strenght with we are",
      rating: 4.9,
      reviews: "6.8K review",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Kamoun",
      subtitle: "Movement aims to biceps",
      rating: 4.9,
      reviews: "6.8K review",
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop",
    },
  ];

  const CircularProgress = ({ progress = 0.1 }) => {
    return (
      <View className="items-center justify-center mb-8">
        <View className="relative">
          {/* Background circle */}
          <View
            className="w-48 h-48 rounded-full border-8 items-center justify-center"
            style={{ borderColor: "#4B5563" }}
          >
            <Image source={require("../../assets/runner.png")} className="mr-5" />
          </View>

          {/* Progress circle */}
          <View
            className="absolute top-0 left-0 w-48 h-48 rounded-full border-8"
            style={{
              borderColor: "#06B6D4",
              borderTopColor: "transparent",
              borderRightColor: "transparent",
              transform: [{ rotate: `${progress * 360}deg` }],
            }}
          />

          {/* Runner icon in center */}
        </View>
      </View>
    );
  };

  if (!member) {
    //loading
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#2D1B69" />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-start px-6 pt-4 mb-8">
            <View className="flex-1">
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-white text-3xl font-bold leading-tight"
              >
                Welcome back{"\n"}
                {member.first_name ? member.first_name.split(" ")[0] : "User"}!
              </Text>
            </View>
            <TouchableOpacity className="mt-2">
              <Ionicons name="trophy-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Time Display */}
          <View className="mx-6 mb-6">
            <View
              className="rounded-xl px-4 py-2 flex-row justify-between items-center"
              style={{ backgroundColor: "#F59E0B" }}
            >
              <Text className="text-black font-semibold">Today</Text>
              <Text className="text-black font-mono">{currentDate}</Text>
            </View>
          </View>

          {/* Filter Buttons */}
          <View className="flex-row justify-between px-6 mb-8">
            <TouchableOpacity
              onPress={() => setSelectedMetric(selectedMetric === "Steps" ? "Distance" : "Steps")}
              className="bg-white rounded-full px-6 py-3 flex-row items-center flex-1 mr-3"
            >
              <Text className="text-gray-800 font-medium mr-2">{selectedMetric}</Text>
              <Ionicons name="chevron-down" size={16} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedPeriod(selectedPeriod === "Today" ? "This Week" : "Today")}
              className="bg-white rounded-full px-6 py-3 flex-row items-center flex-1"
            >
              <Text className="text-gray-800 font-medium mr-2">{selectedPeriod}</Text>
              <Ionicons name="chevron-down" size={16} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Circular Progress */}
          <CircularProgress progress={0.65} />

          {/* Challenges Section */}
          <View className="px-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-white text-2xl font-bold"
              >
                Challenges
              </Text>
              <TouchableOpacity>
                <Text className="text-cyan-400 font-medium">See All</Text>
              </TouchableOpacity>
            </View>

            {/* Challenge Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
              {challenges.map((challenge, index) => (
                <TouchableOpacity
                  key={challenge.id}
                  className="w-60 rounded-2xl overflow-hidden mr-3"
                  style={{ backgroundColor: "#1F2937" }}
                >
                  <View className="h-32 bg-gray-600 relative">
                    {/* Placeholder for background image */}
                    <View
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.4)",
                      }}
                    />
                    <View className="absolute bottom-2 left-3">
                      <Text className="text-white text-lg font-bold">{challenge.title}</Text>
                    </View>
                  </View>

                  <View className="p-3">
                    <Text className="text-gray-300 text-sm mb-2">{challenge.subtitle}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text className="text-white text-sm ml-1 mr-2">{challenge.rating}</Text>
                      <Text className="text-gray-400 text-xs">({challenge.reviews})</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
