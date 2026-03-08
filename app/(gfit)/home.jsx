import React, { useState, useEffect, useRef } from "react";
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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Pedometer } from "expo-sensors";
import { useGlobalContext } from "../../context/GlobalContext";
import { useSaveSteps, useGetMemberSteps, useUpdateStepGoal } from "../../api/fitnessApi";
import { useGetActiveChallenge } from "../../api/challengesApi";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { showToast } from "../../constants";

// Sync configuration constants
const SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes
const RETRY_DELAYS = [5000, 15000, 30000, 60000]; // Exponential backoff: 5s, 15s, 30s, 1min

export default function FitnessDashboard() {
  const [currentDate, setCurrentDate] = useState("");
  const [stepCount, setStepCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChallengeData, setActiveChallengeData] = useState(null);
  const [showXPModal, setShowXPModal] = useState(false);
  const { member } = useGlobalContext();
  const pulseAnim = new Animated.Value(1);

  // Refs for offline queue and sync management
  const syncQueueRef = useRef([]);
  const syncIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  // API hooks
  const saveStepsMutation = useSaveSteps();
  const getMemberStepsMutation = useGetMemberSteps();
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

  // Set up periodic sync interval
  useEffect(() => {
    if (!member?.token_key) return;

    // Sync every 30 minutes
    syncIntervalRef.current = setInterval(() => {
      syncStepsToBackend();
    }, SYNC_INTERVAL);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [member, stepCount]);

  // Sync when app backgrounds or closes
  useEffect(() => {
    return () => {
      // Final sync on unmount
      if (stepCount > 0 && member?.token_key) {
        syncStepsToBackend();
      }
    };
  }, [stepCount]);

  const initializeAppData = async () => {
    try {
      await initializePedometer();
      await loadWeeklyStepsFromBackend();
    } catch (error) {
      console.error("Error initializing app data:", error);
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
            }
          },
          onError: (error) => {
            console.error("Error loading weekly steps:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error loading weekly steps:", error);
    }
  };

  /**
   * Main sync function with offline queue and retry logic
   */
  const syncStepsToBackend = async (forceSync = false) => {
    if (!member?.token_key) {
      console.log("Member token not available, skipping sync");
      return;
    }

    // Prevent concurrent syncs
    if (isSyncing && !forceSync) {
      console.log("Sync already in progress");
      return;
    }

    setIsSyncing(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      const stepData = {
        member_token_key: member.token_key,
        date: today,
        steps_count: stepCount,
        timestamp: new Date().toISOString(),
      };

      // Add to queue if not already there
      const existingIndex = syncQueueRef.current.findIndex((item) => item.date === stepData.date);

      if (existingIndex >= 0) {
        // Update existing entry with latest step count
        syncQueueRef.current[existingIndex] = stepData;
      } else {
        syncQueueRef.current.push(stepData);
      }

      // Process queue
      await processQueue();
    } catch (error) {
      console.error("Error in syncStepsToBackend:", error);
      scheduleRetry();
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Process the offline queue with retry logic
   */
  const processQueue = async () => {
    if (syncQueueRef.current.length === 0) {
      return;
    }

    // Process oldest entry first
    const stepData = syncQueueRef.current[0];

    try {
      await new Promise((resolve, reject) => {
        saveStepsMutation.mutate(stepData, {
          onSuccess: (data) => {
            // Remove from queue on success
            syncQueueRef.current.shift();
            setLastSyncTime(new Date());
            retryCountRef.current = 0; // Reset retry count on success

            console.log("Steps synced successfully:", data);

            if (syncQueueRef.current.length === 0) {
              showToast("success", "Sync Complete", `${stepData.steps_count.toLocaleString()} steps synced`);
            }

            resolve(data);
          },
          onError: (error) => {
            console.error("Error saving steps:", error);
            reject(error);
          },
        });
      });

      // If there are more items in queue, process them
      if (syncQueueRef.current.length > 0) {
        await processQueue();
      }
    } catch (error) {
      console.error("Queue processing error:", error);
      scheduleRetry();
    }
  };

  /**
   * Schedule retry with exponential backoff
   */
  const scheduleRetry = () => {
    if (retryCountRef.current >= RETRY_DELAYS.length) {
      showToast("error", "Sync Failed", "Unable to sync steps. Will retry automatically.");
      retryCountRef.current = 0; // Reset after max retries
      return;
    }

    const delay = RETRY_DELAYS[retryCountRef.current];
    retryCountRef.current++;

    console.log(`Scheduling retry #${retryCountRef.current} in ${delay}ms`);

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      console.log("Retrying sync...");
      processQueue();
    }, delay);
  };

  const initializePedometer = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(isAvailable);

      if (isAvailable) {
        // Get today's steps from device
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const todaySteps = await Pedometer.getStepCountAsync(start, end);
        setStepCount(todaySteps.steps);

        // Get weekly steps from device
        if (weeklySteps.length === 0) {
          await getWeeklyStepsFromDevice();
        }

        // Watch for new steps
        const subscription = Pedometer.watchStepCount((result) => {
          setStepCount((prevSteps) => prevSteps + result.steps);
        });

        return () => subscription && subscription.remove();
      }
    } catch (error) {
      console.error("Pedometer initialization error:", error);
      // Fallback to demo data if pedometer unavailable
      if (stepCount === 0) {
        setStepCount(7542);
      }
      if (weeklySteps.length === 0) {
        setWeeklySteps([8500, 6200, 9100, 7500, 8900, 7800, 7542]);
      }
    }
  };

  const getWeeklyStepsFromDevice = async () => {
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
          showToast("success", "Goal Updated", `New daily goal: ${newGoal.toLocaleString()} steps`);
        },
        onError: (error) => {
          console.error("Error updating daily goal:", error);
          showToast("error", "Update Failed", "Could not update daily goal");
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
              // Force immediate sync for manual entries
              setTimeout(() => syncStepsToBackend(true), 500);
            }
          },
        },
      ],
      "plain-text",
      stepCount.toString()
    );
  };

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
    if (!member?.token_key) {
      showToast("error", "Error", "User data not loaded yet. Please wait a moment.");
      return;
    }

    setRefreshing(true);

    try {
      showToast("info", "Refreshing", "Syncing your latest activity data...");

      // Force sync current steps
      await syncStepsToBackend(true);

      // Reload data
      await Promise.all([loadWeeklyStepsFromBackend(), getWeeklyStepsFromDevice()]);

      // Reload challenge
      loadActiveChallenge();

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
      // Sync before leaving
      if (stepCount > 0 && member?.token_key) {
        await syncStepsToBackend(true);
      }

      // Clear stored user data
      await SecureStore.deleteItemAsync("token_key");
      await SecureStore.deleteItemAsync("member");
      await SecureStore.deleteItemAsync("selectedApp");

      router.replace("/(selection)/select-app");
    } catch (error) {
      console.log("Error clearing stored data:", error);
      router.replace("/(selection)/select-app");
    }
  };

  // Format last sync time
  const getLastSyncText = () => {
    if (!lastSyncTime) return "Never synced";

    const now = new Date();
    const diffMs = now - lastSyncTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
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
              colors={["#06B6D4", "#3B82F6"]}
              tintColor="#06B6D4"
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
                <TouchableOpacity onPress={() => syncStepsToBackend(true)}>
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
                    <Ionicons name="cloud-upload-outline" size={20} color={isSyncing ? "#F59E0B" : "#10B981"} />
                  </LinearGradient>
                </TouchableOpacity>

                {/* <TouchableOpacity onPress={handleManualStepEntry}>
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
                </TouchableOpacity> */}

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

              {/* Family XP Bar */}
              <TouchableOpacity onPress={() => setShowXPModal(true)} className="my-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 bg-purple-500/20 rounded-lg items-center justify-center mr-2">
                      <Ionicons name="star" size={14} color="#8B5CF6" />
                    </View>
                    <Text className="text-white font-semibold text-sm">Family XP</Text>
                    <Ionicons name="information-circle-outline" size={16} color="#8B5CF6" style={{ marginLeft: 6 }} />
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-purple-400 text-xs font-bold">Level 7</Text>
                    <Text className="text-gray-400 text-xs ml-1">• 2,850 / 4,200 XP</Text>
                  </View>
                </View>

                <View className="bg-gray-800/50 backdrop-blur rounded-xl p-3 border border-gray-700/30">
                  <View className="bg-gray-700 h-2.5 rounded-full overflow-hidden mb-2">
                    <LinearGradient
                      colors={["#8B5CF6", "#A855F7", "#C084FC"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="h-full rounded-full"
                      style={{
                        width: "68%", // 2850 / 4200 = 67.86%
                        shadowColor: "#8B5CF6",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 4,
                      }}
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Ionicons name="trophy" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
                      <Text className="text-gray-300 text-xs">1,350 XP to next level</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-purple-400 text-xs font-medium">+120 XP today</Text>
                      <Ionicons name="trending-up" size={12} color="#10B981" style={{ marginLeft: 4 }} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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

          {/* Sync Status Indicator */}
          {(isSyncing || syncQueueRef.current.length > 0) && (
            <View className="px-6 mb-6">
              <LinearGradient
                colors={["rgba(6, 182, 212, 0.2)", "rgba(59, 130, 246, 0.2)"]}
                className="rounded-2xl p-4 border border-cyan-500/50"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-xl bg-cyan-500/20 items-center justify-center mr-3">
                      <Ionicons name={isSyncing ? "sync" : "cloud-outline"} size={20} color="#06B6D4" />
                    </View>
                    <View>
                      <Text className="text-cyan-400 text-sm font-medium">
                        {isSyncing ? "Syncing..." : `${syncQueueRef.current.length} pending`}
                      </Text>
                      <Text className="text-cyan-600 text-xs mt-0.5">Last sync: {getLastSyncText()}</Text>
                    </View>
                  </View>
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

      {/* Family XP Modal */}
      <Modal visible={showXPModal} transparent={true} animationType="fade" onRequestClose={() => setShowXPModal(false)}>
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View
            className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-700/50 max-h-[85%]"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.5,
              shadowRadius: 25,
              elevation: 25,
            }}
          >
            {/* Modal Header with Gradient */}
            <LinearGradient
              colors={["#8B5CF6", "#A855F7", "#C084FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-6 py-5"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-xl mb-1">
                    Family XP System
                  </Text>
                  <Text className="text-white/80 text-sm">Level up together as a family</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowXPModal(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl items-center justify-center"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  }}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              {/* Current Level Card */}
              <View
                className="bg-purple-500/10 backdrop-blur rounded-2xl p-4 mb-5 border border-purple-500/30"
                style={{
                  shadowColor: "#8B5CF6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-purple-500/30 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="star" size={20} color="#8B5CF6" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-lg">Level 7</Text>
                      <Text className="text-purple-300 text-xs">Fitness Enthusiasts</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-purple-400 text-base font-bold">2,850 XP</Text>
                    <Text className="text-gray-400 text-xs">of 4,200 XP</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="bg-gray-700/50 h-2 rounded-full overflow-hidden mb-1">
                  <LinearGradient
                    colors={["#8B5CF6", "#A855F7", "#C084FC"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full rounded-full"
                    style={{ width: "68%" }}
                  />
                </View>
                <Text className="text-gray-300 text-xs text-center">1,350 XP needed for Level 8</Text>
              </View>

              {/* How to Earn XP - Compact Grid */}
              <View className="mb-5">
                <Text className="text-white font-bold text-base mb-3">How to Earn XP</Text>
                <View className="space-y-2">
                  <View className="flex-row items-center bg-gray-800/30 rounded-xl p-3">
                    <View className="w-8 h-8 bg-green-500/20 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="footsteps" size={16} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-sm">Daily Steps</Text>
                      <Text className="text-gray-400 text-xs">+1 XP per 100 steps</Text>
                    </View>
                    <Text className="text-green-400 text-sm font-bold">+75 XP</Text>
                  </View>

                  <View className="flex-row items-center bg-gray-800/30 rounded-xl p-3">
                    <View className="w-8 h-8 bg-blue-500/20 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="trophy" size={16} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-sm">Challenges</Text>
                      <Text className="text-gray-400 text-xs">Complete family challenges</Text>
                    </View>
                    <Text className="text-blue-400 text-sm font-bold">+250 XP</Text>
                  </View>

                  <View className="flex-row items-center bg-gray-800/30 rounded-xl p-3">
                    <View className="w-8 h-8 bg-orange-500/20 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="calendar" size={16} color="#F97316" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-sm">Daily Streaks</Text>
                      <Text className="text-gray-400 text-xs">Consecutive active days</Text>
                    </View>
                    <Text className="text-orange-400 text-sm font-bold">+50 XP</Text>
                  </View>
                </View>
              </View>

              {/* Level Benefits & System Info - Combined */}
              <View className="mb-5">
                <View className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-purple-500/30 rounded-lg items-center justify-center mr-2">
                        <Ionicons name="gift" size={14} color="#8B5CF6" />
                      </View>
                      <Text className="text-purple-300 font-semibold text-sm">Level Benefits</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="sparkles" size={14} color="#F59E0B" style={{ marginRight: 4 }} />
                      <Text className="text-amber-400 text-xs font-medium">Next at Level 10</Text>
                    </View>
                  </View>
                  <Text className="text-gray-300 text-xs leading-4 mb-2">
                    Unlock exclusive family badges, avatars, and special challenges.
                  </Text>
                  <Text className="text-gray-400 text-xs leading-4">
                    Higher levels require exponentially more XP, making them more prestigious.
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowXPModal(false);
                  router.push("/(gfit)/challenges");
                }}
                className="mb-4"
              >
                <LinearGradient
                  colors={["#8B5CF6", "#A855F7", "#C084FC"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 rounded-2xl"
                  style={{
                    shadowColor: "#8B5CF6",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="rocket-outline" size={20} color="white" style={{ marginRight: 6 }} />
                    <Text className="text-white text-center font-bold text-base">Join Challenge to Earn XP</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
