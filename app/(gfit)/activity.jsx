import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useSaveSteps, useGetWeeklySteps, useGetSteps, useGetMemberSteps } from "../../api/fitnessApi";
import { LinearGradient } from "expo-linear-gradient";

export default function FitnessHomeDashboard() {
  const [userName, setUserName] = useState("Youssef");
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMemberStepsMutation = useGetMemberSteps();

  useEffect(() => {
    loadUserData();
    loadWeeklyStepsData();
  }, []);

  const loadUserData = async () => {
    try {
      const memberData = await SecureStore.getItemAsync("member");
      if (memberData) {
        const member = JSON.parse(memberData);
        setUserName(member.username || "User");
        return;
      }
    } catch (error) {
      setUserName("User");
    }
  };

  const loadWeeklyStepsData = async () => {
    try {
      setIsLoading(true);

      const memberToken = await SecureStore.getItemAsync("token_key");
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const fromDate = sevenDaysAgo.toISOString().split("T")[0];
      const toDate = today.toISOString().split("T")[0];

      getMemberStepsMutation.mutate(
        {
          member_token_key: memberToken || "",
          from_date: fromDate,
          to_date: toDate,
        },
        {
          onSuccess: (data) => {
            if (data?.steps && Array.isArray(data.steps)) {
              const stepsArray = data.steps.map((stepData) => stepData.steps || 0);
              setWeeklySteps(stepsArray);
            } else {
              loadDemoWeeklySteps();
            }
            setIsLoading(false);
          },
          onError: (error) => {
            console.error("Error loading weekly steps from backend:", error);
            loadDemoWeeklySteps();
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("Error in loadWeeklyStepsData:", error);
      loadDemoWeeklySteps();
      setIsLoading(false);
    }
  };

  const loadDemoWeeklySteps = () => {
    const demoSteps = [8500, 6200, 9100, 7500, 8900, 7800, 7542];
    setWeeklySteps(demoSteps);
  };

  const getWeekLabels = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(days[date.getDay()]);
    }

    return labels;
  };

  const getMotivationalMessage = () => {
    const todaySteps = weeklySteps[weeklySteps.length - 1] || 0;

    if (todaySteps >= 10000) {
      return "💪 Great job! You've hit your step goal!";
    } else if (todaySteps >= 8000) {
      return "🚀 You're doing great! Almost there!";
    } else {
      return "📈 Let's get moving! Every step counts!";
    }
  };

  const CustomChart = () => {
    if (isLoading) {
      return (
        <View className="px-6 mb-8">
          <View className="bg-gray-800 border border-gray-700 rounded-2xl p-6 items-center justify-center h-64">
            <Text className="text-gray-400 text-lg">Loading step data...</Text>
          </View>
        </View>
      );
    }

    const maxSteps = Math.max(...weeklySteps);
    const totalSteps = weeklySteps.reduce((sum, steps) => sum + steps, 0);
    const avgSteps = Math.round(totalSteps / weeklySteps.length);
    const dayLabels = getWeekLabels();

    return (
      <View className="px-6 mb-8">
        {/* Chart Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-2xl mb-1">
              7-Day Steps
            </Text>
            <Text className="text-gray-400 text-sm">Average: {avgSteps.toLocaleString()} steps</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-cyan-400 rounded-full mr-2" />
            <Text className="text-gray-400 text-sm">Today</Text>
          </View>
        </View>

        {/* Chart */}
        <View
          className="bg-gray-800 border border-gray-700 rounded-2xl p-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
          }}
        >
          <View className="flex-row justify-between items-end" style={{ height: 180 }}>
            {weeklySteps.map((steps, index) => {
              const height = Math.max((steps / maxSteps) * 160, 14);
              const isToday = index === weeklySteps.length - 1;

              return (
                <View key={index} className="items-center flex-1">
                  {isToday ? (
                    <LinearGradient
                      colors={["#06B6D4", "#3B82F6"]}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                      className="w-8 rounded-xl"
                      style={{
                        height,
                        shadowColor: "#06B6D4",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
                      }}
                    />
                  ) : (
                    <View className="w-8 rounded-xl bg-gray-600" style={{ height }} />
                  )}
                  <Text className="text-gray-400 text-xs mt-2 font-medium">{dayLabels[index]}</Text>
                  <Text className="text-white text-xs font-semibold">{(steps / 1000).toFixed(1)}k</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Weekly Summary */}
        <View className="flex-row mt-4" style={{ gap: 12 }}>
          <View className="flex-1">
            <LinearGradient
              colors={["rgba(16, 185, 129, 0.2)", "rgba(5, 150, 105, 0.2)"]}
              className="border border-green-500/30 rounded-xl p-4"
            >
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center mr-2">
                  <Ionicons name="trending-up" size={16} color="#10B981" />
                </View>
                <Text className="text-green-400 text-xs font-medium">Best Day</Text>
              </View>
              <Text className="text-white text-2xl font-bold">{maxSteps.toLocaleString()}</Text>
            </LinearGradient>
          </View>
          <View className="flex-1">
            <LinearGradient
              colors={["rgba(59, 130, 246, 0.2)", "rgba(37, 99, 235, 0.2)"]}
              className="border border-blue-500/30 rounded-xl p-4"
            >
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-blue-500/20 rounded-full items-center justify-center mr-2">
                  <Ionicons name="calendar" size={16} color="#3B82F6" />
                </View>
                <Text className="text-blue-400 text-xs font-medium">This Week</Text>
              </View>
              <Text className="text-white text-2xl font-bold">{totalSteps.toLocaleString()}</Text>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className="text-white text-4xl leading-tight"
                >
                  Hi!,{"\n"}
                  {userName}
                </Text>
                <Text className="text-gray-400 text-base mt-2">{getMotivationalMessage()}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(gfit)/challenges")}>
                <LinearGradient
                  colors={["#F59E0B", "#F97316"]}
                  className="p-3 rounded-xl"
                  style={{
                    shadowColor: "#F59E0B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                  }}
                >
                  <Ionicons name="trophy" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Chart Section */}
          <CustomChart />

          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
