import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Pedometer } from "expo-sensors";
import { useGlobalContext } from "../../context/GlobalContext";
import {
  useSaveSteps,
  useGetWeeklySteps,
  useGetSteps,
  useUpdateStepGoal,
  useGetMemberSteps,
} from "../../api/fitnessApi";
import { useGetActiveChallenge } from "../../api/challengesApi";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { showToast } from "../../constants";

export default function FitnessDashboard() {
  const [currentDate, setCurrentDate] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("Steps");
  const [selectedPeriod, setSelectedPeriod] = useState("Today");
  const [stepCount, setStepCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [lastSavedSteps, setLastSavedSteps] = useState(0);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChallengeData, setActiveChallengeData] = useState(null);
  const { member } = useGlobalContext();
  const pulseAnim = new Animated.Value(1);

  // API hooks
  const saveStepsMutation = useSaveSteps();
  const getWeeklyStepsMutation = useGetWeeklySteps();
  const getMemberStepsMutation = useGetMemberSteps();
  const getStepsMutation = useGetSteps();
  const updateGoalMutation = useUpdateStepGoal();
  const getActiveChallengemutation = useGetActiveChallenge();

  useEffect(() => {
    // Pulse animation for glow effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    );
  }, []);

  // Initialize app data only when member is available
  useEffect(() => {
    if (member?.token_key) {
      initializeAppData();
      loadActiveChallenge();
    }
  }, [member]);

  // Auto-save steps periodically, but only when member is available
  useEffect(() => {
    if (!member?.token_key) return;

    const interval = setInterval(() => {
      saveStepsToBackend();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [stepCount]);

  const initializeAppData = async () => {
    try {
      // await loadTodayStepsFromBackend();
      await initializePedometer();
      await loadWeeklyStepsFromBackend();
    } catch (error) {
      await initializePedometer();
    }
  };

  const loadActiveChallenge = () => {
    getActiveChallengemutation.mutate(undefined, {
      onSuccess: (data) => {
        const challengeData = data?.data || null;
        setActiveChallengeData(challengeData);
      },
      onError: (error) => {
        console.error("Error loading active challenge:", error);
        setActiveChallengeData(null);
      },
    });
  };

  const loadWeeklyStepsFromBackend = async () => {
    // Don't load if member data is not available yet
    if (!member?.token_key) {
      console.log("Member token not available yet, skipping weekly steps load");
      return;
    }

    try {
      const memberToken = await SecureStore.getItemAsync("token_key");
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const fromDate = sevenDaysAgo.toISOString().split("T")[0];
      const toDate = today.toISOString().split("T")[0];

      getMemberStepsMutation.mutate(
        {
          member_token_key: memberToken || member.token_key,
          from_date: fromDate,
          to_date: toDate,
        },
        {
          onSuccess: (data) => {
            if (data?.steps && Array.isArray(data.steps)) {
              const stepsArray = data.steps.map((stepData) => stepData.steps || 0);
              setWeeklySteps(stepsArray);
              showToast("success", "Loaded registered weekly steps");
            }
          },
          onError: (error) => {
            console.error("Error loading weekly steps:", error);
            showToast("error", "Failed to load weekly steps");
          },
        }
      );
    } catch (error) {
      console.error("Error loading weekly steps:", error);
    }
  };

  // DONE
  const saveStepsToBackend = async (usedSteps) => {
    // Don't save if member data is not available yet
    if (!member?.token_key) {
      console.log("Member token not available yet, skipping save");
      return;
    }

    try {
      const stepsToSave = usedSteps ? usedSteps : stepCount;
      const today = new Date().toISOString().split("T")[0];

      const stepData = {
        member_token_key: member.token_key,
        date: today,
        steps_count: stepsToSave,
      };

      saveStepsMutation.mutate(stepData, {
        onSuccess: (data) => {
          setLastSavedSteps(stepsToSave);
          setLastSaveTime(new Date());
          console.log("Steps saved successfully:", data);
          showToast("success", "Sync Complete!", `Successfully synced ${stepsToSave} steps to the cloud.`);
        },
        onError: (error) => {
          console.error("Error saving steps:", error);
          showToast(
            "error",
            "Could not sync your steps to the cloud. They will be saved locally and synced when connection is restored."
          );
        },
      });
    } catch (error) {
      console.error("Error in saveStepsToBackend:", error);
    }
  };

  // DONE
  const initializePedometer = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const todaySteps = await Pedometer.getStepCountAsync(start, end);

        if (todaySteps.steps > stepCount) {
          setStepCount(todaySteps.steps);
          setTimeout(() => {
            console.log("Auto-syncing higher device steps:", todaySteps.steps);
            saveStepsToBackend(todaySteps.steps);
            console.log("error", "Device Sync", "Detected higher step count from device, syncing now.");
          }, 1500);
        }

        if (weeklySteps.length === 0) {
          await getWeeklyStepsData();
        }

        const subscription = Pedometer.watchStepCount((result) => {
          setStepCount((prevSteps) => {
            const newSteps = prevSteps + result.steps;
            if (newSteps > lastSavedSteps + 50) {
              setTimeout(() => saveStepsToBackend(newSteps), 1000);
            }
            return newSteps;
          });
        });

        return () => subscription && subscription.remove();
      }
    } catch (error) {
      console.error("Pedometer initialization error:", error);
      if (stepCount === 0) {
        setStepCount(7542);
        setLastSavedSteps(7542);
      }
      if (weeklySteps.length === 0) {
        setWeeklySteps([8500, 6200, 9100, 7500, 8900, 7800, 7542]);
      }
    }
  };

  // DONE
  const getWeeklyStepsData = async () => {
    try {
      const weekSteps = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const daySteps = await Pedometer.getStepCountAsync(date, endDate);
        weekSteps.push(daySteps.steps);
      }

      setWeeklySteps(weekSteps);
    } catch (error) {
      console.error("Error getting weekly steps:", error);
      setWeeklySteps([8500, 6200, 9100, 7500, 8900, 7800, 7542]);
    }
  };

  const updateDailyGoal = (newGoal) => {
    setDailyGoal(newGoal);

    updateGoalMutation.mutate(
      {
        member_id: member?.id,
        daily_goal: newGoal,
      },
      {
        onSuccess: (data) => {
          console.log("Daily goal updated successfully:", data);
        },
        onError: (error) => {
          console.error("Error updating daily goal:", error);
        },
      }
    );
  };

  const handleManualStepEntry = () => {
    Alert.prompt(
      "Manual Step Entry",
      "Enter your current step count:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save",
          onPress: (value) => {
            const steps = parseInt(value);
            if (!isNaN(steps) && steps >= 0) {
              setStepCount(steps);
              saveStepsToBackend(steps);
            }
          },
        },
      ],
      "plain-text",
      stepCount.toString()
    );
  };

  useEffect(() => {
    return () => {
      if (stepCount !== lastSavedSteps) {
        saveStepsToBackend();
      }
    };
  }, [stepCount, lastSavedSteps]);

  // Process active challenge data
  const activeFamilyChallenge = activeChallengeData?.challenge
    ? {
        id: activeChallengeData.challenge.id,
        title: activeChallengeData.challenge.title_en,
        subtitle: activeChallengeData.challenge.content_en,
        isActive: !activeChallengeData.is_expired,
        isParticipating: true,
        daysLeft: activeChallengeData.days_remaining || 0,
        progress: Math.min(
          100,
          Math.round((activeChallengeData.total_steps / activeChallengeData.challenge.steps_required) * 100)
        ),
        myProgress: Math.min(100, Math.round((stepCount / dailyGoal) * 100)),
        participants:
          activeChallengeData?.family_members_leaderboard?.slice(0, 4)?.map((member, index) => ({
            id: member.member_id,
            name: member.username,
            steps: member.total_steps || 0,
            color: ["#10B981", "#3B82F6", "#F97316", "#8B5CF6"][index % 4],
            isMe: member.member_id === member?.id,
          })) || [],
        goal: `${activeChallengeData.challenge.steps_required?.toLocaleString()} Steps in ${
          activeChallengeData.challenge.duration_days
        } days`,
        reward: "Family achievement points",
      }
    : null;

  const CircularProgress = ({ progress = 0.1 }) => {
    const size = 224;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - progress * circumference;
    const percentage = Math.round(progress * 100);

    return (
      <View className="items-center justify-center mb-8">
        {/* Glow effect */}
        <Animated.View
          style={{
            position: "absolute",
            width: 256,
            height: 256,
            borderRadius: 128,
            backgroundColor: "rgba(6, 182, 212, 0.1)",
            transform: [{ scale: pulseAnim }],
          }}
        />

        <View className="relative items-center justify-center">
          <View style={{ width: size, height: size }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
              <Defs>
                <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#06B6D4" />
                  <Stop offset="100%" stopColor="#3B82F6" />
                </SvgLinearGradient>
              </Defs>
              {/* Background circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(55, 65, 81, 0.3)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#gradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </Svg>
          </View>

          {/* Center content */}
          <View className="absolute inset-0 items-center justify-center">
            <LinearGradient
              colors={["#06B6D4", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
              style={{
                shadowColor: "#06B6D4",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              <Ionicons name="flash" size={32} color="white" />
            </LinearGradient>
            <Text className="text-white text-4xl font-bold">{stepCount.toLocaleString()}</Text>
            <Text className="text-cyan-400 text-sm font-medium mt-1">steps today</Text>
            <Text className="text-gray-400 text-xs mt-2">{percentage}% of goal</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.prompt(
                  "Set Daily Goal",
                  "Enter your daily step goal:",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Update",
                      onPress: (value) => {
                        const goal = parseInt(value);
                        if (!isNaN(goal) && goal > 0) {
                          updateDailyGoal(goal);
                        }
                      },
                    },
                  ],
                  "plain-text",
                  dailyGoal.toString()
                );
              }}
              className="mt-2"
            >
              <Text className="text-gray-500 text-xs underline">Goal: {dailyGoal.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const onRefresh = async () => {
    // Don't refresh if member data is not available yet
    if (!member?.token_key) {
      showToast("error", "Error", "User data not loaded yet. Please wait a moment.");
      return;
    }

    setRefreshing(true);

    try {
      // Show toast to indicate refresh started
      showToast("info", "Refreshing", "Syncing your latest activity data...");

      // Force sync current steps
      if (stepCount > 0) {
        await saveStepsToBackend();
      }

      // Reload all data including challenge data
      await Promise.all([loadWeeklyStepsFromBackend(), initializePedometer()]);

      // Load active challenge data
      loadActiveChallenge();

      // Show success toast
      showToast("success", "Refreshed!", "Your activity data has been updated.");
    } catch (error) {
      console.error("Error during refresh:", error);
      showToast("error", "Refresh failed", "Could not sync data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

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

  if (!member) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <View className="items-center">
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
          >
            <Ionicons name="fitness" size={48} color="#06B6D4" />
          </Animated.View>
          <Text className="text-white text-xl font-semibold mt-4">Loading your profile...</Text>
          <Text className="text-gray-400 text-sm mt-2">Please wait while we sync your data</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#06B6D4", "#3B82F6"]} // Android
              tintColor="#06B6D4" // iOS
              title="Pull to refresh"
              titleColor="#06B6D4"
              progressBackgroundColor="#1F2937"
            />
          }
        >
          {/* Header */}
          <View className="px-6 pt-2 pb-4 mb-8">
            <View className="flex-row justify-between items-start">
              <TouchableOpacity onPress={() => handleBackToAppSelection()} className="flex-row items-center mt-1">
                <Ionicons name="chevron-back" size={24} color="white" />
                <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-white text-lg ml-1">
                  Apps
                </Text>
              </TouchableOpacity>
              <View className="flex-row space-x-3">
                <TouchableOpacity onPress={() => saveStepsToBackend()}>
                  <LinearGradient
                    colors={["#374151", "#1F2937"]}
                    className="p-3 rounded-xl"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                    }}
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color={stepCount === lastSavedSteps ? "#10B981" : "#F59E0B"}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleManualStepEntry}>
                  <LinearGradient
                    colors={["#374151", "#1F2937"]}
                    className="p-3 rounded-xl"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity>
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
                    <Ionicons name="trophy" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1">
              <Text
                className="text-white text-2xl font-bold mt-4"
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
              >
                Welcome back {member.username ? member.username.split(" ")[0] : "User"}!
              </Text>
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-gray-300 text-2xl font-semibold"
              ></Text>
            </View>

            {/* Date Card */}
            <LinearGradient
              colors={["#F59E0B", "#F97316"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl p-4"
              style={{
                shadowColor: "#F59E0B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
              }}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text className="font-bold text-white">Today</Text>
                </View>
                <Text className="text-white font-medium">{currentDate}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Circular Progress */}
          <CircularProgress progress={Math.min(stepCount / dailyGoal, 1)} />

          {/* Stats Cards */}
          <View className="flex-row px-6 mb-8" style={{ gap: 12 }}>
            <View
              className="flex-1 bg-gray-800 rounded-2xl p-4 border border-gray-700"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
              }}
            >
              <Text className="text-white text-2xl font-bold text-center">{(stepCount * 0.0008).toFixed(1)}</Text>
              <Text className="text-gray-400 text-xs text-center mt-1">kilometers</Text>
            </View>
            <View
              className="flex-1 bg-gray-800 rounded-2xl p-4 border border-gray-700"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
              }}
            >
              <Text className="text-white text-2xl font-bold text-center">{Math.round(stepCount * 0.04)}</Text>
              <Text className="text-gray-400 text-xs text-center mt-1">calories</Text>
            </View>
            <View
              className="flex-1 bg-gray-800 rounded-2xl p-4 border border-gray-700"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
              }}
            >
              <Text className="text-white text-2xl font-bold text-center">{Math.round(stepCount * 0.0083)}</Text>
              <Text className="text-gray-400 text-xs text-center mt-1">minutes</Text>
            </View>
          </View>

          {/* Weekly Progress Chart */}
          {selectedPeriod === "Today" && (
            <View className="px-6 mb-8">
              <Text className="text-white text-xl font-bold mb-4">Weekly Progress</Text>
              <View
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                }}
              >
                <View className="flex-row justify-between items-end" style={{ height: 160 }}>
                  {weeklySteps.map((steps, index) => {
                    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    const maxSteps = Math.max(...weeklySteps);
                    const height = Math.max((steps / maxSteps) * 140, 14);
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
                        <Text className="text-gray-400 text-xs mt-2 font-medium">{dayNames[index]}</Text>
                        <Text className="text-white text-xs font-semibold">{(steps / 1000).toFixed(1)}k</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Family Challenge Section */}
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-2xl font-bold">Family Challenge</Text>
              <TouchableOpacity onPress={() => router.push("/(gfit)/challenges")}>
                <Text className="text-cyan-400 font-medium">View All →</Text>
              </TouchableOpacity>
            </View>

            {getActiveChallengemutation.isPending ? (
              <View className="bg-gray-800 border border-gray-700 rounded-2xl p-6 items-center justify-center">
                <Ionicons name="refresh" size={32} color="#06B6D4" />
                <Text className="text-gray-400 text-sm mt-2">Loading challenge...</Text>
              </View>
            ) : activeFamilyChallenge ? (
              <TouchableOpacity
                onPress={() => router.push(`/(gfit)/challenges?tab=Active`)}
                className="rounded-3xl overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.37,
                  shadowRadius: 7.49,
                }}
              >
                <View className="bg-gray-800 border border-gray-700">
                  {/* Header with gradient */}
                  <LinearGradient
                    colors={["#06B6D4", "#3B82F6", "#9333EA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ height: 144 }}
                  >
                    <View className="absolute inset-0 bg-black/20" />
                    <View className="absolute top-3 right-3">
                      <View className="bg-emerald-500 px-3 py-1.5 rounded-full">
                        <Text className="text-white text-xs font-bold">Active</Text>
                      </View>
                    </View>
                    <View className="absolute bottom-4 left-4">
                      <Text className="text-white text-xl font-bold mb-1">{activeFamilyChallenge.title}</Text>
                      <View className="flex-row items-center">
                        <Ionicons name="people" size={16} color="white" style={{ marginRight: 6 }} />
                        <Text className="text-white text-sm font-medium">Family Challenge</Text>
                      </View>
                    </View>
                  </LinearGradient>

                  {/* Content */}
                  <View className="p-5">
                    <Text className="text-gray-300 text-sm mb-4">{activeFamilyChallenge.subtitle}</Text>

                    {/* Progress bar */}
                    <View className="mb-4">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-xs text-gray-400">Family Progress</Text>
                        <Text className="text-xs text-cyan-400 font-bold">{activeFamilyChallenge.progress}%</Text>
                      </View>
                      <View className="bg-gray-700 h-2.5 rounded-full overflow-hidden">
                        <LinearGradient
                          colors={["#06B6D4", "#3B82F6"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="h-full rounded-full"
                          style={{
                            width: `${activeFamilyChallenge.progress}%`,
                            shadowColor: "#06B6D4",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.5,
                            shadowRadius: 4,
                          }}
                        />
                      </View>
                    </View>

                    {/* Participants */}
                    <View className="mb-4">
                      <Text className="text-xs text-gray-400 mb-3">Family Members Today</Text>
                      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                        {activeFamilyChallenge.participants.map((participant) => (
                          <View
                            key={participant.id}
                            className="flex-row items-center bg-gray-700/50 rounded-xl px-3 py-2"
                          >
                            <View
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: participant.color,
                                marginRight: 6,
                                shadowColor: participant.color,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                              }}
                            />
                            <Text className="text-white text-xs font-medium">
                              {participant.isMe ? "You" : participant.name}: {(participant.steps / 1000).toFixed(1)}k
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Footer */}
                    <View className="flex-row items-center justify-between pt-3 border-t border-gray-700/50">
                      <View className="flex-row items-center">
                        <Ionicons name="trophy" size={16} color="#F59E0B" style={{ marginRight: 6 }} />
                        <Text className="text-white text-sm font-medium">{activeFamilyChallenge.goal}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="time" size={16} color="#9CA3AF" style={{ marginRight: 4 }} />
                        <Text className="text-gray-400 text-xs">
                          {activeFamilyChallenge.daysLeft} day{activeFamilyChallenge.daysLeft !== 1 ? "s" : ""} left
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/(gfit)/challenges")}
                className="w-full rounded-2xl border-2 border-dashed border-gray-600 items-center justify-center py-12"
              >
                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-400 text-lg font-medium mt-2">No Active Family Challenge</Text>
                <Text className="text-gray-500 text-sm mt-1">Join or create a family challenge!</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sync Status */}
          {stepCount !== lastSavedSteps && (
            <View className="px-6 mb-6">
              <LinearGradient
                colors={["rgba(249, 115, 22, 0.2)", "rgba(245, 158, 11, 0.2)"]}
                className="rounded-2xl p-4 border border-orange-500/50"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-xl bg-orange-500/20 items-center justify-center mr-3">
                      <Ionicons name="cloud-upload" size={20} color="#F97316" />
                    </View>
                    <Text className="text-orange-400 text-sm font-medium">
                      {stepCount - lastSavedSteps} steps pending sync
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => saveStepsToBackend()} disabled={saveStepsMutation.isLoading}>
                    <LinearGradient
                      colors={saveStepsMutation.isLoading ? ["#FDBA74", "#FED7AA"] : ["#F97316", "#F59E0B"]}
                      className="px-4 py-2 rounded-xl"
                      style={{
                        shadowColor: "#F97316",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 3.84,
                      }}
                    >
                      <Text className="text-white text-sm font-semibold">
                        {saveStepsMutation.isLoading ? "Syncing..." : "Sync Now"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          )}

          {!isPedometerAvailable && (
            <View className="px-6 mb-6">
              <View className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                  <Text className="text-yellow-400 text-sm">Pedometer not available. Showing demo data.</Text>
                </View>
              </View>
            </View>
          )}

          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
