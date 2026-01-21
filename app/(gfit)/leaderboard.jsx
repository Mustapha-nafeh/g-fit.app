import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Image, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGetActiveChallenge, useGetFamiliesLeaderboard } from "../../api/challengesApi";
import { useGlobalContext } from "../../context/GlobalContext";
import { LinearGradient } from "expo-linear-gradient";
import { showToast } from "../../constants";

export default function ChallengeLeaderboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("Today");
  const [activeChallengeData, setActiveChallengeData] = useState(null);
  const [familiesLeaderboard, setFamiliesLeaderboard] = useState([]);
  const { member } = useGlobalContext();

  const getActiveChallengemutation = useGetActiveChallenge();
  const getFamiliesLeaderboardMutation = useGetFamiliesLeaderboard();

  useEffect(() => {
    if (member?.token_key) {
      loadActiveChallenge();
    }
  }, [member]);

  const loadActiveChallenge = () => {
    // Don't load if member data is not available yet
    if (!member?.token_key) {
      console.log("Member token not available yet, skipping challenge load");
      return;
    }

    getActiveChallengemutation.mutate(undefined, {
      onSuccess: (data) => {
        const challengeData = data?.data || null;
        setActiveChallengeData(challengeData);

        if (challengeData?.challenge?.id) {
          loadFamiliesLeaderboard(challengeData.challenge.id);
        } else {
          showToast("info", "No Active Challenge", "Join a challenge to see the leaderboard");
        }
      },
      onError: (error) => {
        console.error("Error loading active challenge:", error);
        setActiveChallengeData(null);
        showToast("error", "Loading Failed", "Could not load challenge data. Please try again.");
      },
    });
  };

  const loadFamiliesLeaderboard = (challengeId) => {
    getFamiliesLeaderboardMutation.mutate(challengeId, {
      onSuccess: (data) => {
        setFamiliesLeaderboard(data?.data || []);
        showToast("success", "Leaderboard Updated", "Latest challenge standings loaded");
      },
      onError: (error) => {
        console.error("Error loading families leaderboard:", error);
        showToast("error", "Loading Failed", "Could not load leaderboard data");
      },
    });
  };

  const activeChallenge = activeChallengeData?.challenge
    ? {
        id: activeChallengeData.challenge.id,
        title: activeChallengeData.challenge.title_en,
        description: activeChallengeData.challenge.content_en,
        goal: `${activeChallengeData.challenge.steps_required?.toLocaleString()} steps in ${
          activeChallengeData.challenge.duration_days
        } days`,
        daysLeft: activeChallengeData.days_remaining || 0,
        totalDays: activeChallengeData.challenge.duration_days,
        startDate: new Date(activeChallengeData.joined_at),
        endDate: new Date(activeChallengeData.deadline),
        isExpired: activeChallengeData.is_expired,
      }
    : null;

  const processedFamiliesLeaderboard = familiesLeaderboard.map((family) => ({
    ...family,
    isYours: activeChallengeData?.family?.id === family.family_id,
  }));

  const familyStats = activeChallengeData
    ? {
        totalSteps: activeChallengeData.total_steps || 0,
        dailyGoal: activeChallengeData.challenge.steps_required || 10000,
        weeklyProgress: Math.min(
          100,
          Math.round((activeChallengeData.total_steps / activeChallengeData.challenge.steps_required) * 100)
        ),
        position: processedFamiliesLeaderboard.find((f) => f.family_id === activeChallengeData.family?.id)?.rank || 1,
        totalFamilies: familiesLeaderboard.length || 1,
      }
    : {
        totalSteps: 0,
        dailyGoal: 10000,
        weeklyProgress: 0,
        position: 1,
        totalFamilies: 1,
      };

  const familyMembers =
    activeChallengeData?.family_members_leaderboard?.map((member, index) => ({
      id: member.member_id,
      name: member.username,
      avatar: member.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      todaySteps: member.total_steps || 0,
      weeklySteps: member.total_steps || 0,
      dailyGoal: activeChallengeData.challenge.steps_required || 10000,
      streak: 0,
      position: member.rank || index + 1,
      isMe: false,
    })) || [];

  const timeframes = ["Today", "This Week", "All Time"];

  const formatSteps = (steps) => {
    if (steps >= 1000) {
      return (steps / 1000).toFixed(1) + "k";
    }
    return steps.toString();
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${position}`;
    }
  };

  const FamilyMemberCard = ({ member }) => (
    <View
      className={`flex-row items-center p-4 rounded-2xl mb-3 ${
        member.isMe ? "border-2 border-cyan-500" : "border border-gray-700"
      }`}
      style={{
        backgroundColor: member.isMe ? "rgba(6, 182, 212, 0.1)" : "rgba(31, 41, 55, 0.5)",
        shadowColor: member.isMe ? "#06B6D4" : "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: member.isMe ? 0.3 : 0.2,
        shadowRadius: 3.84,
      }}
    >
      <View className="flex-row items-center mr-4">
        <Text className="text-2xl mr-3 font-bold">{getPositionIcon(member.position)}</Text>
        <Image
          source={{ uri: member.avatar }}
          className="w-12 h-12 rounded-full"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        />
      </View>

      <View className="flex-1">
        <Text
          style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
          className={`text-lg ${member.isMe ? "text-cyan-400" : "text-white"}`}
        >
          {member.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="footsteps" size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm ml-1">
            {selectedTimeframe === "Today"
              ? `${member.todaySteps.toLocaleString()} steps today`
              : `${member.weeklySteps.toLocaleString()} steps this week`}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Ionicons name="flame" size={14} color="#F59E0B" />
          <Text className="text-gray-400 text-sm ml-1">{member.streak} day streak</Text>
        </View>
      </View>

      <View className="items-end">
        <View
          className={`w-3 h-3 rounded-full mb-2 ${
            selectedTimeframe === "Today"
              ? member.todaySteps >= member.dailyGoal
                ? "bg-green-500"
                : "bg-orange-500"
              : "bg-cyan-500"
          }`}
          style={{
            shadowColor:
              selectedTimeframe === "Today"
                ? member.todaySteps >= member.dailyGoal
                  ? "#10B981"
                  : "#F97316"
                : "#06B6D4",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        />
        <Text className="text-gray-400 text-xs font-medium">
          {selectedTimeframe === "Today"
            ? `${Math.round((member.todaySteps / member.dailyGoal) * 100)}%`
            : formatSteps(member.weeklySteps)}
        </Text>
      </View>
    </View>
  );

  const FamilyLeaderboardCard = ({ family }) => (
    <View
      className={`flex-row items-center p-4 rounded-2xl mb-3 ${
        family.isYours ? "border-2 border-purple-500" : "border border-gray-700"
      }`}
      style={{
        backgroundColor: family.isYours ? "rgba(139, 92, 246, 0.1)" : "rgba(31, 41, 55, 0.5)",
        shadowColor: family.isYours ? "#8B5CF6" : "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: family.isYours ? 0.3 : 0.2,
        shadowRadius: 3.84,
      }}
    >
      <View className="flex-row items-center mr-4">
        <Text className="text-2xl mr-3 font-bold">{getPositionIcon(family.rank)}</Text>
        <View className="w-12 h-12 rounded-full bg-gray-700 justify-center items-center overflow-hidden">
          {family.family_avatar ? (
            <Image source={{ uri: family.family_avatar }} className="w-12 h-12 rounded-full" resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={["#374151", "#1F2937"]}
              className="w-12 h-12 rounded-full justify-center items-center"
            >
              <Ionicons name="people" size={20} color="#9CA3AF" />
            </LinearGradient>
          )}
        </View>
      </View>

      <View className="flex-1">
        <Text
          style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
          className={`text-lg ${family.isYours ? "text-purple-400" : "text-white"}`}
        >
          {family.family_name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="footsteps" size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm ml-1">{family.total_steps?.toLocaleString() || 0} total steps</Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Ionicons name="calendar" size={14} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm ml-1">Joined {new Date(family.joined_at).toLocaleDateString()}</Text>
        </View>
      </View>

      <View className="items-end">
        <LinearGradient colors={["#06B6D4", "#3B82F6"]} className="px-3 py-1.5 rounded-full">
          <Text className="text-white text-xs font-bold">#{family.rank}</Text>
        </LinearGradient>
        <Text className="text-gray-400 text-xs mt-2 font-medium">{formatSteps(family.total_steps || 0)}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={getActiveChallengemutation.isPending || getFamiliesLeaderboardMutation.isPending}
              onRefresh={loadActiveChallenge}
              tintColor="#06B6D4"
            />
          }
        >
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-1">
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className="text-white text-3xl leading-tight"
                >
                  Challenge{"\n"}Leaderboard
                </Text>
              </View>
              <View className="flex-row" style={{ gap: 12 }}>
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
                    <Ionicons name="trophy" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={loadActiveChallenge}
                  disabled={getActiveChallengemutation.isPending || getFamiliesLeaderboardMutation.isPending}
                >
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
                    <Ionicons name="refresh" size={20} color="#06B6D4" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="px-6">
            {/* Active Challenge Info */}
            {getActiveChallengemutation.isPending ? (
              <View className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-6 items-center">
                <Text className="text-cyan-400">Loading active challenge...</Text>
              </View>
            ) : activeChallenge ? (
              <View
                className="rounded-2xl overflow-hidden mb-6"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                }}
              >
                <LinearGradient
                  colors={["rgba(6, 182, 212, 0.2)", "rgba(59, 130, 246, 0.2)"]}
                  className="border border-cyan-500/30 p-5"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-3">
                      <Text
                        style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                        className="text-cyan-400 text-xl mb-2"
                      >
                        {activeChallenge.title}
                      </Text>
                      <Text className="text-gray-300 text-sm mb-2">{activeChallenge.description}</Text>
                      <Text className="text-gray-400 text-xs">{activeChallenge.goal}</Text>
                    </View>
                    <View
                      className={`px-3 py-1.5 rounded-full ${
                        activeChallenge.isExpired ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      <Text className="text-white text-xs font-bold">
                        {activeChallenge.isExpired ? "Expired" : "Active"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center pt-3 border-t border-cyan-500/20">
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-cyan-500/20 rounded-full items-center justify-center mr-2">
                        <Ionicons name="time" size={16} color="#06B6D4" />
                      </View>
                      <Text className="text-gray-300 text-sm">
                        {activeChallenge.daysLeft > 0
                          ? `${activeChallenge.daysLeft} day${activeChallenge.daysLeft !== 1 ? "s" : ""} left`
                          : "Challenge ended"}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 bg-cyan-500/20 rounded-full items-center justify-center mr-2">
                        <Ionicons name="people" size={16} color="#06B6D4" />
                      </View>
                      <Text className="text-gray-300 text-sm">{familyStats.totalFamilies} families</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            ) : (
              <View
                className="bg-gray-800 border border-gray-700 rounded-2xl p-8 mb-6 items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                }}
              >
                <Ionicons name="trophy-outline" size={64} color="#4B5563" />
                <Text className="text-gray-400 text-lg font-medium mt-4">No Active Challenge</Text>
                <Text className="text-gray-500 text-sm mt-2 text-center">Join a challenge to see the leaderboard</Text>
                <TouchableOpacity onPress={() => router.push("/(gfit)/challenges")} className="mt-4">
                  <LinearGradient
                    colors={["#06B6D4", "#3B82F6"]}
                    className="px-6 py-3 rounded-xl"
                    style={{
                      shadowColor: "#06B6D4",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3.84,
                    }}
                  >
                    <Text className="text-white font-semibold">Browse Challenges</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Family Progress Summary */}
            {activeChallenge && (
              <View
                className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mb-6"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                }}
              >
                <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-xl mb-4">
                  Your Family Progress
                </Text>

                <View className="flex-row justify-between mb-5" style={{ gap: 12 }}>
                  <View className="flex-1 bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                    <Text className="text-purple-400 text-xs mb-1">Position</Text>
                    <Text className="text-white text-2xl font-bold">#{familyStats.position}</Text>
                    <Text className="text-gray-400 text-xs">of {familyStats.totalFamilies}</Text>
                  </View>
                  <View className="flex-1 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
                    <Text className="text-cyan-400 text-xs mb-1">Total Steps</Text>
                    <Text className="text-white text-2xl font-bold">{formatSteps(familyStats.totalSteps)}</Text>
                    <Text className="text-gray-400 text-xs">steps</Text>
                  </View>
                  <View className="flex-1 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                    <Text className="text-green-400 text-xs mb-1">Progress</Text>
                    <Text className="text-white text-2xl font-bold">{familyStats.weeklyProgress}%</Text>
                    <Text className="text-gray-400 text-xs">complete</Text>
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400 text-sm">Challenge Goal Progress</Text>
                    <Text className="text-cyan-400 text-sm font-semibold">{familyStats.weeklyProgress}%</Text>
                  </View>
                  <View className="bg-gray-700 h-3 rounded-full overflow-hidden">
                    <LinearGradient
                      colors={["#06B6D4", "#3B82F6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="h-full rounded-full"
                      style={{
                        width: `${familyStats.weeklyProgress}%`,
                        shadowColor: "#06B6D4",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 4,
                      }}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Family Members Leaderboard */}
            {activeChallenge && (
              <>
                {/* Timeframe Selector */}
                <View
                  className="bg-gray-800 border border-gray-700 rounded-2xl p-1.5 mb-6"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }}
                >
                  <View className="flex-row">
                    {timeframes.map((timeframe) => (
                      <TouchableOpacity
                        key={timeframe}
                        onPress={() => setSelectedTimeframe(timeframe)}
                        className="flex-1"
                      >
                        {selectedTimeframe === timeframe ? (
                          <LinearGradient colors={["#06B6D4", "#3B82F6"]} className="py-3 rounded-xl">
                            <Text className="text-center font-semibold text-white">{timeframe}</Text>
                          </LinearGradient>
                        ) : (
                          <View className="py-3">
                            <Text className="text-center font-medium text-gray-400">{timeframe}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="mb-6">
                  <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-xl mb-4">
                    Family Members
                  </Text>
                  {familyMembers.length > 0 ? (
                    familyMembers.map((member) => <FamilyMemberCard key={member.id} member={member} />)
                  ) : (
                    <View className="bg-gray-800 border border-gray-700 rounded-2xl p-6 items-center">
                      <Text className="text-gray-400">No family members found</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Families Leaderboard */}
            {activeChallenge && (
              <View className="mb-6">
                <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-xl mb-4">
                  All Families
                </Text>
                {getFamiliesLeaderboardMutation.isPending ? (
                  <View className="bg-gray-800 border border-gray-700 rounded-2xl p-6 items-center">
                    <Text className="text-gray-400">Loading families leaderboard...</Text>
                  </View>
                ) : processedFamiliesLeaderboard.length > 0 ? (
                  processedFamiliesLeaderboard.map((family) => (
                    <FamilyLeaderboardCard key={family.family_id} family={family} />
                  ))
                ) : (
                  <View className="bg-gray-800 border border-gray-700 rounded-2xl p-6 items-center">
                    <Text className="text-gray-400">No families participating yet</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
