import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Alert, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useGlobalContext } from "../../context/GlobalContext";
import {
  useGetAvailableChallenges,
  useGetChallengeHistory,
  useJoinChallenge,
  useLeaveChallenge,
} from "../../api/challengesApi";
import { LinearGradient } from "expo-linear-gradient";

export default function ChallengesPage() {
  const { tab } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState("Available");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const { member } = useGlobalContext();

  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [challengeHistory, setChallengeHistory] = useState([]);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const getAvailableChallengesMutation = useGetAvailableChallenges();
  const getChallengeHistoryMutation = useGetChallengeHistory();
  const joinChallengeMutation = useJoinChallenge();
  const leaveChallengeMutation = useLeaveChallenge();

  useEffect(() => {
    if (tab && ["Available", "Active", "Completed"].includes(tab)) {
      setSelectedTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    loadAvailableChallenges();
  }, []);

  useEffect(() => {
    if (selectedTab === "Completed" && challengeHistory.length === 0) {
      loadChallengeHistory(1, true);
    }
  }, [selectedTab]);

  const loadAvailableChallenges = () => {
    getAvailableChallengesMutation.mutate(undefined, {
      onSuccess: (data) => {
        setAvailableChallenges(data?.data || []);
      },
      onError: (error) => {
        console.error("Error loading available challenges:", error);
        Alert.alert("Error", "Failed to load challenges");
      },
    });
  };

  const loadChallengeHistory = (page = 1, isInitial = false) => {
    if (isLoadingHistory || (!hasMoreHistory && !isInitial)) return;

    setIsLoadingHistory(true);
    getChallengeHistoryMutation.mutate(
      { page },
      {
        onSuccess: (data) => {
          const historyData = data?.data || [];

          if (isInitial) {
            setChallengeHistory(historyData);
            setCurrentHistoryPage(1);
          } else {
            setChallengeHistory((prev) => [...prev, ...historyData]);
          }

          setHasMoreHistory(historyData.length > 0);
          setCurrentHistoryPage(page);
          setIsLoadingHistory(false);
        },
        onError: (error) => {
          console.error("Error loading challenge history:", error);
          setIsLoadingHistory(false);
        },
      }
    );
  };

  const loadMoreHistory = () => {
    if (!isLoadingHistory && hasMoreHistory) {
      loadChallengeHistory(currentHistoryPage + 1);
    }
  };

  const getFilteredChallenges = () => {
    switch (selectedTab) {
      case "Available":
        return availableChallenges;
      case "Active":
        return availableChallenges.filter((challenge) => challenge.currently_in_challenge);
      case "Completed":
        return challengeHistory;
      default:
        return [];
    }
  };

  const handleJoinChallenge = (challenge) => {
    const alertTitle = "Join Challenge";
    const alertMessage = `Are you sure you want to join "${
      challenge.title_en || challenge.title
    }"? You'll need to complete ${challenge.steps_required?.toLocaleString()} steps within ${
      challenge.duration_days
    } days.`;

    Alert.alert(alertTitle, alertMessage, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Join",
        onPress: () => {
          joinChallengeMutation.mutate(
            { challenge_id: challenge.id },
            {
              onSuccess: (data) => {
                Alert.alert("Success! 🎉", "You've successfully joined the challenge. Good luck!");
                loadAvailableChallenges();
              },
              onError: (error) => {
                console.error("Error joining challenge:", error);
                Alert.alert("Error", "Failed to join challenge. Please try again.");
              },
            }
          );
        },
      },
    ]);
  };

  const handleLeaveChallenge = (challenge) => {
    Alert.alert(
      "Leave Challenge",
      `Are you sure you want to leave "${challenge.title_en || challenge.title}"? Your progress will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leaveChallengeMutation.mutate(
              { challenge_id: challenge.id },
              {
                onSuccess: (data) => {
                  Alert.alert("Success", "You've left the challenge.");
                  loadAvailableChallenges();
                },
                onError: (error) => {
                  console.error("Error leaving challenge:", error);
                  Alert.alert("Error", "Failed to leave challenge. Please try again.");
                },
              }
            );
          },
        },
      ]
    );
  };

  const tabs = ["Available", "Active", "Completed"];

  const renderChallenges = () => {
    const challenges = getFilteredChallenges();
    const isLoading =
      selectedTab === "Available" || selectedTab === "Active"
        ? getAvailableChallengesMutation.isPending
        : isLoadingHistory;

    return (
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-400 text-sm mb-4">
          {selectedTab === "Available" && "Join a challenge to compete with your family and earn rewards!"}
          {selectedTab === "Active" && "Your currently active challenges"}
          {selectedTab === "Completed" && "Your completed challenge history"}
        </Text>

        {isLoading && challenges.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-400">Loading challenges...</Text>
          </View>
        ) : challenges.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="trophy-outline" size={64} color="#4B5563" />
            <Text className="text-gray-400 mt-4 text-center">
              {selectedTab === "Available" && "No challenges available"}
              {selectedTab === "Active" && "No active challenges"}
              {selectedTab === "Completed" && "No completed challenges"}
            </Text>
          </View>
        ) : (
          <View className="pb-32">
            {challenges.map((challenge, index) => (
              <TouchableOpacity
                key={challenge.id}
                onPress={() => setSelectedChallenge(challenge)}
                className="mb-4 rounded-3xl overflow-hidden"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                }}
              >
                <View className="bg-gray-800 border border-gray-700">
                  {/* Challenge Image/Header */}
                  {challenge.image ? (
                    <View className="h-32 relative">
                      <Image source={{ uri: challenge.image }} className="w-full h-full" resizeMode="cover" />
                      <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} className="absolute inset-0" />
                      <View className="absolute bottom-3 left-4">
                        <Text className="text-white text-xl font-bold">{challenge.title_en || challenge.title}</Text>
                      </View>
                      {selectedTab === "Active" && (
                        <View className="absolute top-3 right-3">
                          <View className="bg-emerald-500 px-3 py-1.5 rounded-full">
                            <Text className="text-white text-xs font-bold">Active</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ) : (
                    <LinearGradient
                      colors={["#06B6D4", "#3B82F6", "#9333EA"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ height: 120 }}
                    >
                      <View className="absolute inset-0 bg-black/20" />
                      <View className="absolute bottom-3 left-4">
                        <Text className="text-white text-xl font-bold">{challenge.title_en || challenge.title}</Text>
                      </View>
                      {selectedTab === "Active" && (
                        <View className="absolute top-3 right-3">
                          <View className="bg-emerald-500 px-3 py-1.5 rounded-full">
                            <Text className="text-white text-xs font-bold">Active</Text>
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  )}

                  <View className="p-5">
                    <Text className="text-gray-300 text-sm mb-4">
                      {challenge.content_en || challenge.description || "Complete the challenge to earn rewards!"}
                    </Text>

                    {/* Stats */}
                    <View className="flex-row mb-4" style={{ gap: 16 }}>
                      <View className="flex-1 bg-gray-700/50 rounded-xl p-3">
                        <View className="flex-row items-center justify-center mb-1">
                          <Ionicons name="time-outline" size={16} color="#06B6D4" />
                        </View>
                        <Text className="text-white text-center font-semibold">{challenge.duration_days}</Text>
                        <Text className="text-gray-400 text-xs text-center">days</Text>
                      </View>
                      <View className="flex-1 bg-gray-700/50 rounded-xl p-3">
                        <View className="flex-row items-center justify-center mb-1">
                          <Ionicons name="footsteps-outline" size={16} color="#06B6D4" />
                        </View>
                        <Text className="text-white text-center font-semibold">
                          {(challenge.steps_required / 1000).toFixed(0)}k
                        </Text>
                        <Text className="text-gray-400 text-xs text-center">steps</Text>
                      </View>
                      <View className="flex-1 bg-gray-700/50 rounded-xl p-3">
                        <View className="flex-row items-center justify-center mb-1">
                          <Ionicons name="people-outline" size={16} color="#06B6D4" />
                        </View>
                        <Text className="text-white text-center font-semibold">
                          {challenge.active_families_count || challenge.joined_families_count || 0}
                        </Text>
                        <Text className="text-gray-400 text-xs text-center">families</Text>
                      </View>
                    </View>

                    {/* Action Button */}
                    {selectedTab === "Active" && (
                      <TouchableOpacity onPress={() => handleLeaveChallenge(challenge)}>
                        <LinearGradient
                          colors={["#EF4444", "#DC2626"]}
                          className="py-3 rounded-xl"
                          style={{
                            shadowColor: "#EF4444",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 3.84,
                          }}
                        >
                          <Text className="text-white text-center font-semibold">Leave Challenge</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                    {selectedTab === "Available" && !challenge.currently_in_challenge && (
                      <TouchableOpacity onPress={() => handleJoinChallenge(challenge)}>
                        <LinearGradient
                          colors={["#06B6D4", "#3B82F6"]}
                          className="py-3 rounded-xl"
                          style={{
                            shadowColor: "#06B6D4",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 3.84,
                          }}
                        >
                          <Text className="text-white text-center font-semibold">Join Challenge</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                    {selectedTab === "Available" && challenge.currently_in_challenge && (
                      <View className="bg-emerald-500 py-3 rounded-xl">
                        <View className="flex-row items-center justify-center">
                          <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 6 }} />
                          <Text className="text-white text-center font-semibold">Already Joined</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Load More Button */}
            {selectedTab === "Completed" && hasMoreHistory && !isLoadingHistory && (
              <TouchableOpacity onPress={loadMoreHistory} className="mb-4">
                <LinearGradient colors={["#374151", "#1F2937"]} className="py-3 rounded-xl">
                  <Text className="text-cyan-400 text-center font-medium">Load More</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {selectedTab === "Completed" && isLoadingHistory && (
              <View className="py-4">
                <Text className="text-gray-400 text-center">Loading more...</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <LinearGradient colors={["#374151", "#1F2937"]} className="p-2 rounded-xl">
                  <Ionicons name="chevron-back" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-2xl">
                Family Challenges
              </Text>
            </View>
          </View>

          {/* Info Banner */}
          <LinearGradient
            colors={["rgba(6, 182, 212, 0.2)", "rgba(59, 130, 246, 0.2)"]}
            className="rounded-2xl p-4 border border-cyan-500/30"
            style={{
              shadowColor: "#06B6D4",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3.84,
            }}
          >
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 bg-cyan-500/20 rounded-full items-center justify-center mr-2">
                <Ionicons name="information-circle" size={18} color="#06B6D4" />
              </View>
              <Text className="text-cyan-400 font-semibold">Challenge Rules</Text>
            </View>
            <Text className="text-gray-300 text-sm">
              Families can only join one challenge at a time. Work together to complete goals and earn rewards!
            </Text>
          </LinearGradient>
        </View>

        {/* Tab Navigation */}
        <View className="px-6 mb-4">
          <View
            className="bg-gray-800 border border-gray-700 rounded-2xl p-1.5"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <View className="flex-row">
              {tabs.map((tab) => (
                <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)} className="flex-1">
                  {selectedTab === tab ? (
                    <LinearGradient colors={["#06B6D4", "#3B82F6"]} className="py-3 rounded-xl">
                      <Text className="text-center font-semibold text-white">{tab}</Text>
                    </LinearGradient>
                  ) : (
                    <View className="py-3">
                      <Text className="text-center font-medium text-gray-400">{tab}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Content */}
        {renderChallenges()}
      </SafeAreaView>

      {/* Challenge Details Modal */}
      <Modal
        visible={!!selectedChallenge}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedChallenge(null)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-gray-900 rounded-t-3xl max-h-3/4">
            {selectedChallenge && (
              <>
                {/* Modal Header */}
                <View className="flex-row justify-between items-center p-6 border-b border-gray-800">
                  <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-xl">
                    Challenge Details
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedChallenge(null)}>
                    <View className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center">
                      <Ionicons name="close" size={24} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>

                <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                  <Text className="text-white text-xl font-bold mb-2">
                    {selectedChallenge.title_en || selectedChallenge.title}
                  </Text>
                  <Text className="text-gray-300 text-sm mb-6">
                    {selectedChallenge.content_en || selectedChallenge.description}
                  </Text>

                  {/* Stats Grid */}
                  <View className="flex-row mb-6" style={{ gap: 12 }}>
                    <View className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4">
                      <Ionicons name="time-outline" size={24} color="#06B6D4" style={{ marginBottom: 8 }} />
                      <Text className="text-white text-lg font-bold">{selectedChallenge.duration_days}</Text>
                      <Text className="text-gray-400 text-xs">days</Text>
                    </View>
                    <View className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4">
                      <Ionicons name="footsteps-outline" size={24} color="#06B6D4" style={{ marginBottom: 8 }} />
                      <Text className="text-white text-lg font-bold">
                        {selectedChallenge.steps_required?.toLocaleString()}
                      </Text>
                      <Text className="text-gray-400 text-xs">steps</Text>
                    </View>
                    <View className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4">
                      <Ionicons name="people-outline" size={24} color="#06B6D4" style={{ marginBottom: 8 }} />
                      <Text className="text-white text-lg font-bold">
                        {selectedChallenge.active_families_count || 0}
                      </Text>
                      <Text className="text-gray-400 text-xs">families</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedChallenge(null);
                      handleJoinChallenge(selectedChallenge);
                    }}
                  >
                    <LinearGradient
                      colors={["#06B6D4", "#3B82F6"]}
                      className="py-4 rounded-xl mb-6"
                      style={{
                        shadowColor: "#06B6D4",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4.65,
                      }}
                    >
                      <Text className="text-white text-center font-bold text-lg">Join Challenge</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
