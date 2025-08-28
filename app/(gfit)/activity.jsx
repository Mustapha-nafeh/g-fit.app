import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

export default function FitnessHomeDashboard() {
  const [userName, setUserName] = useState("Youssef");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync("selectedUser");
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name.charAt(0).toUpperCase() + user.name.slice(1));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const weekData = [
    { day: "Mon", value: 320 },
    { day: "Tues", value: 450 },
    { day: "Wed", value: 280 },
    { day: "Thurs", value: 380 },
    { day: "Fri", value: 505 },
    { day: "Sat", value: 420 },
    { day: "Sun", value: 350 },
  ];

  const todayActivities = [
    {
      id: 1,
      title: "Run 02 km",
      completed: true,
      color: "#F59E0B",
    },
    {
      id: 2,
      title: "Muscle Up",
      subtitle: "10 reps • 3 sets with 20 sec rest",
      completed: false,
      color: "#6B7280",
    },
  ];

  const CustomChart = () => {
    const screenWidth = Dimensions.get("window").width;
    const currentIndex = weekData.findIndex((d) => d.day === "Sun");

    return (
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <LineChart
          data={{
            labels: weekData.map((item) => item.day.toLowerCase()),
            datasets: [
              {
                data: weekData.map((item) => item.value),
                color: () => `#ffffff`, // line color
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 48}
          height={200}
          withDots={true}
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          chartConfig={{
            backgroundColor: "#262135",
            backgroundGradientFrom: "#262135",
            backgroundGradientTo: "#262135",
            decimalPlaces: 0,
            color: () => `#ffffff`,
            labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#FDE68A",
              fill: "#FDE68A",
            },
          }}
          bezier
          style={{
            paddingRight: 0,
            paddingLeft: 0,
          }}
        />

        {/* Highlight tooltip for current day */}
        {currentIndex !== -1 && (
          <View
            style={{
              position: "absolute",
              top: 30,
              left: ((screenWidth - 48) / (weekData.length - 1)) * currentIndex - 25,
              alignItems: "center",
            }}
          ></View>
        )}
      </View>
    );
  };

  const ActivityItem = ({ activity }) => (
    <View className="flex-row items-center py-3">
      <View
        className={`w-6 h-6 rounded-full mr-4 items-center justify-center ${
          activity.completed ? "bg-yellow-400" : "bg-gray-600"
        }`}
      >
        {activity.completed && <View className="w-2 h-2 bg-black rounded-full" />}
      </View>

      <View className="flex-1">
        <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-lg font-medium">
          {activity.title}
        </Text>
        {activity.subtitle && (
          <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gray-400 text-sm">
            {activity.subtitle}
          </Text>
        )}
      </View>

      {!activity.completed && <View className="w-px h-8 bg-gray-600 ml-4" />}
    </View>
  );

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
                className="text-white text-4xl font-bold leading-tight"
              >
                Hi!,{"\n"}
                {userName}
              </Text>
            </View>
            <TouchableOpacity className="mt-4">
              <Ionicons name="trophy-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Chart Section */}
          <CustomChart />

          {/* Schedule Section */}
          <View className="px-6">
            <Text
              style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
              className="text-white text-3xl font-bold mb-2"
            >
              Your{"\n"}Schedule
            </Text>

            <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-gray-300 text-lg mb-6">
              Today's Activity
            </Text>

            {/* Activity Timeline */}
            <View className="relative">
              {todayActivities.map((activity, index) => (
                <View key={activity.id} className="relative">
                  <ActivityItem activity={activity} />
                  {index < todayActivities.length - 1 && (
                    <View className="absolute left-3 top-12 w-px h-8 bg-gray-600" />
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
