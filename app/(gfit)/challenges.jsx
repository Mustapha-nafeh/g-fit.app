import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Modal,
  Image,
  RefreshControl,
} from "react-native";
import { showToast } from "../../constants";
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
  const [refreshing, setRefreshing] = useState(false);

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
      onSuccess: (data) => setAvailableChallenges(data?.data || []),
      onError: (error) => {
        console.error("Error loading available challenges:", error);
        showToast("error", "Error", "Failed to load challenges");
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
        onError: () => setIsLoadingHistory(false),
      }
    );
  };

  const loadMoreHistory = () => {
    if (!isLoadingHistory && hasMoreHistory) loadChallengeHistory(currentHistoryPage + 1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (selectedTab === "Completed") {
      await loadChallengeHistory(1, true);
    } else {
      await loadAvailableChallenges();
    }
    setRefreshing(false);
  };

  const getFilteredChallenges = () => {
    switch (selectedTab) {
      case "Available":
        return availableChallenges;
      case "Active":
        return availableChallenges.filter((c) => c.currently_in_challenge);
      case "Completed":
        return challengeHistory;
      default:
        return [];
    }
  };

  const handleJoinChallenge = (challenge) => {
    joinChallengeMutation.mutate(
      { challenge_id: challenge.id },
      {
        onSuccess: () => {
          showToast("success", "Challenge Joined! 🎉", "Good luck completing the challenge!");
          loadAvailableChallenges();
        },
        onError: () => showToast("error", "Error", "Failed to join challenge. Please try again."),
      }
    );
  };

  const handleLeaveChallenge = (challenge) => {
    leaveChallengeMutation.mutate(
      { challenge_id: challenge.id },
      {
        onSuccess: () => {
          showToast("success", "Left Challenge", "You've left the challenge.");
          loadAvailableChallenges();
        },
        onError: () => showToast("error", "Error", "Failed to leave challenge. Please try again."),
      }
    );
  };

  const tabs = ["Available", "Active", "Completed"];

  // ─── Tab meta ────────────────────────────────────────────────────────────────
  const TAB_META = {
    Available: { icon: "flame-outline", color: "#06B6D4", subtitle: "Join a challenge and compete with your family" },
    Active: { icon: "pulse-outline", color: "#10B981", subtitle: "Your currently active challenges" },
    Completed: { icon: "trophy-outline", color: "#F59E0B", subtitle: "Your completed challenge history" },
  };

  // ─── Stat pill ───────────────────────────────────────────────────────────────
  const StatPill = ({ icon, value, label, color }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.04)",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 6,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <Ionicons name={icon} size={15} color={color} style={{ marginBottom: 4 }} />
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{value}</Text>
      <Text style={{ color: "#6B7280", fontSize: 10, marginTop: 1 }}>{label}</Text>
    </View>
  );

  // ─── Challenge card ──────────────────────────────────────────────────────────
  const ChallengeCard = ({ challenge }) => {
    const isActive = challenge.currently_in_challenge;
    const isCompleted = selectedTab === "Completed";

    return (
      <TouchableOpacity
        onPress={() => setSelectedChallenge(challenge)}
        activeOpacity={0.88}
        style={{
          marginBottom: 16,
          borderRadius: 24,
          overflow: "hidden",
          shadowColor: isActive ? "#10B981" : "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isActive ? 0.25 : 0.35,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View
          style={{
            backgroundColor: "#2D2548",
            borderRadius: 24,
            borderWidth: 1,
            borderColor: isActive ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)",
          }}
        >
          {/* ── Hero banner ── */}
          {challenge.image ? (
            <View style={{ height: 150, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }}>
              <Image source={{ uri: challenge.image }} style={{ width: "100%", height: "130%" }} resizeMode="contain" />
              <LinearGradient
                colors={["transparent", "rgba(10,14,23,0.92)"]}
                style={{ position: "absolute", inset: 0, bottom: 0, height: "100%" }}
              />
              {/* badges */}
              <View style={{ position: "absolute", top: 12, right: 12, flexDirection: "row", gap: 6 }}>
                {isActive && (
                  <LinearGradient
                    colors={["#059669", "#10B981"]}
                    style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.4 }}>● ACTIVE</Text>
                  </LinearGradient>
                )}
                {isCompleted && (
                  <LinearGradient
                    colors={["#D97706", "#F59E0B"]}
                    style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.4 }}>✓ DONE</Text>
                  </LinearGradient>
                )}
              </View>
              <View style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "800",
                    textShadowColor: "rgba(0,0,0,0.6)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 4,
                  }}
                  numberOfLines={1}
                >
                  {challenge.title_en || challenge.title}
                </Text>
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={isActive ? ["#065F46", "#047857", "#0D9488"] : ["#0C1B33", "#0F2746", "#1A3A5C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 120,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                justifyContent: "flex-end",
                padding: 16,
              }}
            >
              <View style={{ position: "absolute", top: 12, right: 12, flexDirection: "row", gap: 6 }}>
                {isActive && (
                  <LinearGradient
                    colors={["#059669", "#10B981"]}
                    style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.4 }}>● ACTIVE</Text>
                  </LinearGradient>
                )}
                {isCompleted && (
                  <LinearGradient
                    colors={["#D97706", "#F59E0B"]}
                    style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.4 }}>✓ DONE</Text>
                  </LinearGradient>
                )}
              </View>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }} numberOfLines={1}>
                {challenge.title_en || challenge.title}
              </Text>
            </LinearGradient>
          )}

          {/* ── Body ── */}
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#9CA3AF", fontSize: 13, lineHeight: 19, marginBottom: 14 }} numberOfLines={2}>
              {challenge.content_en || challenge.description || "Complete the challenge to earn rewards!"}
            </Text>

            {/* Stats row */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
              <StatPill icon="time-outline" value={challenge.duration_days} label="days" color="#06B6D4" />
              <StatPill
                icon="footsteps-outline"
                value={`${(challenge.steps_required / 1000).toFixed(0)}k`}
                label="steps"
                color="#8B5CF6"
              />
              <StatPill
                icon="people-outline"
                value={challenge.active_families_count || challenge.joined_families_count || 0}
                label="families"
                color="#F59E0B"
              />
              {challenge.completion_xp ? (
                <StatPill icon="star-outline" value={`+${challenge.completion_xp}`} label="XP reward" color="#10B981" />
              ) : null}
            </View>

            {/* Action */}
            {selectedTab === "Active" ? (
              <TouchableOpacity
                onPress={() => handleLeaveChallenge(challenge)}
                style={{
                  backgroundColor: "rgba(239,68,68,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(239,68,68,0.35)",
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#F87171", fontWeight: "700", fontSize: 14 }}>Leave Challenge</Text>
              </TouchableOpacity>
            ) : selectedTab === "Available" && !challenge.currently_in_challenge ? (
              <TouchableOpacity onPress={() => handleJoinChallenge(challenge)}>
                <LinearGradient
                  colors={["#06B6D4", "#3B82F6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: "center",
                    shadowColor: "#06B6D4",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35,
                    shadowRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Join Challenge</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : selectedTab === "Available" && challenge.currently_in_challenge ? (
              <View
                style={{
                  backgroundColor: "rgba(16,185,129,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(16,185,129,0.3)",
                  borderRadius: 14,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={{ color: "#34D399", fontWeight: "700", fontSize: 14 }}>Already Joined</Text>
              </View>
            ) : isCompleted ? (
              <View
                style={{
                  backgroundColor: "rgba(245,158,11,0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(245,158,11,0.25)",
                  borderRadius: 14,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Ionicons name="trophy" size={15} color="#F59E0B" />
                <Text style={{ color: "#FCD34D", fontWeight: "700", fontSize: 14 }}>Completed</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── List renderer ───────────────────────────────────────────────────────────
  const renderChallenges = () => {
    const challenges = getFilteredChallenges();
    const isLoading = selectedTab !== "Completed" ? getAvailableChallengesMutation.isPending : isLoadingHistory;
    const meta = TAB_META[selectedTab];

    return (
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#06B6D4" colors={["#06B6D4"]} />
        }
      >
        {/* Sub-header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 6 }}>
          <Ionicons name={meta.icon} size={14} color={meta.color} />
          <Text style={{ color: "#6B7280", fontSize: 13 }}>{meta.subtitle}</Text>
        </View>

        {isLoading && challenges.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "rgba(255,255,255,0.04)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="hourglass-outline" size={28} color="#4B5563" />
            </View>
            <Text style={{ color: "#6B7280", fontSize: 14 }}>Loading challenges…</Text>
          </View>
        ) : challenges.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 64 }}>
            <LinearGradient
              colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.02)"]}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <Ionicons name={meta.icon} size={36} color="#374151" />
            </LinearGradient>
            <Text style={{ color: "#9CA3AF", fontSize: 15, fontWeight: "600", marginBottom: 6 }}>
              {selectedTab === "Available"
                ? "No challenges yet"
                : selectedTab === "Active"
                ? "No active challenges"
                : "No history yet"}
            </Text>
            <Text style={{ color: "#4B5563", fontSize: 13, textAlign: "center", paddingHorizontal: 32 }}>
              {selectedTab === "Active"
                ? "Join a challenge from the Available tab to get started."
                : "Check back soon for new challenges!"}
            </Text>
          </View>
        ) : (
          <>
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}

            {selectedTab === "Completed" && hasMoreHistory && !isLoadingHistory && (
              <TouchableOpacity onPress={loadMoreHistory} style={{ marginTop: 4, marginBottom: 8 }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(6,182,212,0.25)",
                    borderRadius: 14,
                    paddingVertical: 12,
                    alignItems: "center",
                    backgroundColor: "rgba(6,182,212,0.05)",
                  }}
                >
                  <Text style={{ color: "#06B6D4", fontWeight: "600", fontSize: 14 }}>Load more</Text>
                </View>
              </TouchableOpacity>
            )}
            {selectedTab === "Completed" && isLoadingHistory && (
              <Text style={{ color: "#6B7280", textAlign: "center", paddingVertical: 16, fontSize: 13 }}>
                Loading more…
              </Text>
            )}
          </>
        )}
      </ScrollView>
    );
  };

  // ─── Root ────────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} style={{ marginRight: 12 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.07)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "MontserratAlternates_700Bold", color: "#fff", fontSize: 22 }}>
                Family Challenges
              </Text>
            </View>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "rgba(245,158,11,0.12)",
                borderWidth: 1,
                borderColor: "rgba(245,158,11,0.25)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="trophy" size={18} color="#F59E0B" />
            </View>
          </View>

          {/* Rule banner */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(6,182,212,0.07)",
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: "rgba(6,182,212,0.18)",
              gap: 10,
            }}
          >
            <Ionicons name="information-circle-outline" size={18} color="#22D3EE" />
            <Text style={{ color: "#94A3B8", fontSize: 12.5, flex: 1, lineHeight: 18 }}>
              Families can only join <Text style={{ color: "#22D3EE", fontWeight: "600" }}>one challenge</Text> at a
              time. Work together to earn rewards!
            </Text>
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 6, marginTop: 14 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 18,
              padding: 4,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
            }}
          >
            {tabs.map((t) => {
              const active = selectedTab === t;
              const meta = TAB_META[t];
              return (
                <TouchableOpacity key={t} onPress={() => setSelectedTab(t)} style={{ flex: 1 }} activeOpacity={0.8}>
                  {active ? (
                    <LinearGradient
                      colors={
                        t === "Active"
                          ? ["#065F46", "#059669"]
                          : t === "Completed"
                          ? ["#92400E", "#B45309"]
                          : ["#0E7490", "#2563EB"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: 9,
                        borderRadius: 14,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      <Ionicons name={meta.icon} size={13} color="#fff" />
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{t}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={{
                        paddingVertical: 9,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      <Ionicons name={meta.icon} size={13} color="#4B5563" />
                      <Text style={{ color: "#6B7280", fontWeight: "600", fontSize: 13 }}>{t}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Content ── */}
        {renderChallenges()}
      </SafeAreaView>

      {/* ── Challenge Detail Modal ── */}
      <Modal
        visible={!!selectedChallenge}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedChallenge(null)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", paddingHorizontal: 16 }}>
          <View
            style={{
              backgroundColor: "#1E1B2E",
              borderRadius: 28,
              maxHeight: "88%",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.5,
              shadowRadius: 25,
              elevation: 25,
            }}
          >
            {selectedChallenge && (
              <>
                {/* Modal header */}
                <View
                  style={{
                    paddingHorizontal: 20,
                    paddingTop: 8,
                    paddingBottom: 16,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text
                      style={{
                        fontFamily: "MontserratAlternates_700Bold",
                        color: "#fff",
                        fontSize: 21,
                        marginBottom: 3,
                      }}
                    >
                      {selectedChallenge.title_en || selectedChallenge.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Ionicons name="flame-outline" size={13} color="#06B6D4" />
                      <Text style={{ color: "#06B6D4", fontSize: 12, fontWeight: "600" }}>Challenge Details</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedChallenge(null)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.07)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    marginHorizontal: 20,
                    marginBottom: 4,
                  }}
                />

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                >
                  {/* Stats row */}
                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                    {[
                      {
                        icon: "time-outline",
                        value: `${selectedChallenge.duration_days}`,
                        label: "Days",
                        color: "#06B6D4",
                        bg: "rgba(6,182,212,0.1)",
                        border: "rgba(6,182,212,0.2)",
                      },
                      {
                        icon: "footsteps-outline",
                        value: selectedChallenge.steps_required?.toLocaleString(),
                        label: "Steps",
                        color: "#8B5CF6",
                        bg: "rgba(139,92,246,0.1)",
                        border: "rgba(139,92,246,0.2)",
                      },
                      {
                        icon: "people-outline",
                        value: `${selectedChallenge.active_families_count || 0}`,
                        label: "Families",
                        color: "#F59E0B",
                        bg: "rgba(245,158,11,0.1)",
                        border: "rgba(245,158,11,0.2)",
                      },
                      ...(selectedChallenge.completion_xp
                        ? [
                            {
                              icon: "star",
                              value: `+${selectedChallenge.completion_xp}`,
                              label: "XP Reward",
                              color: "#10B981",
                              bg: "rgba(16,185,129,0.1)",
                              border: "rgba(16,185,129,0.2)",
                            },
                          ]
                        : []),
                    ].map(({ icon, value, label, color, bg, border }) => (
                      <View
                        key={label}
                        style={{
                          flex: 1,
                          backgroundColor: bg,
                          borderWidth: 1,
                          borderColor: border,
                          borderRadius: 18,
                          paddingVertical: 14,
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name={icon} size={22} color={color} style={{ marginBottom: 6 }} />
                        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>{value}</Text>
                        <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 2 }}>{label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* About */}
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      borderRadius: 18,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.07)",
                      marginBottom: 20,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          backgroundColor: "rgba(6,182,212,0.12)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="document-text-outline" size={15} color="#06B6D4" />
                      </View>
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>About</Text>
                    </View>
                    <Text style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 22 }}>
                      {selectedChallenge.content_en ||
                        selectedChallenge.description ||
                        "Complete this challenge to improve your fitness and compete with other families!"}
                    </Text>
                  </View>

                  {/* Action */}
                  {!selectedChallenge.currently_in_challenge ? (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedChallenge(null);
                        handleJoinChallenge(selectedChallenge);
                      }}
                    >
                      <LinearGradient
                        colors={["#06B6D4", "#3B82F6", "#8B5CF6"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          borderRadius: 18,
                          paddingVertical: 16,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          shadowColor: "#3B82F6",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.4,
                          shadowRadius: 16,
                          elevation: 10,
                        }}
                      >
                        <Ionicons name="rocket-outline" size={20} color="#fff" />
                        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Join Challenge</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        backgroundColor: "rgba(16,185,129,0.1)",
                        borderWidth: 1,
                        borderColor: "rgba(16,185,129,0.25)",
                        borderRadius: 18,
                        paddingVertical: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      <Text style={{ color: "#34D399", fontWeight: "800", fontSize: 16 }}>Already Joined</Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
