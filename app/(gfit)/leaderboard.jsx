import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Image, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGetActiveChallenge, useGetFamiliesLeaderboard } from "../../api/challengesApi";
import { useGlobalContext } from "../../context/GlobalContext";
import { LinearGradient } from "expo-linear-gradient";
import { showToast } from "../../constants";
import { useGetUnlockedAvatars } from "../../api/profile";

const STORAGE_BASE = "https://backend.g-fit.app/storage/";
const buildImageUrl = (path) => (path ? (path.startsWith("http") ? path : `${STORAGE_BASE}${path}`) : null);

export default function ChallengeLeaderboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("Today");
  const [activeChallengeData, setActiveChallengeData] = useState(null);
  const [familiesLeaderboard, setFamiliesLeaderboard] = useState([]);
  const { member } = useGlobalContext();

  const getActiveChallengemutation = useGetActiveChallenge();
  const getFamiliesLeaderboardMutation = useGetFamiliesLeaderboard();
  const { data: avatarsData } = useGetUnlockedAvatars();

  // Selected family avatar image (from avatars API, same as profile page)
  const selectedAvatarImage = avatarsData?.data?.avatars?.find((a) => a.is_selected)?.image || null;
  const familyAvatarUrl = buildImageUrl(selectedAvatarImage);

  useEffect(() => {
    if (member?.token_key) {
      loadActiveChallenge();
    }
  }, [member]);

  const loadActiveChallenge = () => {
    if (!member?.token_key) {
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
      avatar: buildImageUrl(member.avatar),
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

  const RankBadge = ({ position }) => {
    if (position === 1) return <Text style={{ fontSize: 26 }}>🥇</Text>;
    if (position === 2) return <Text style={{ fontSize: 26 }}>🥈</Text>;
    if (position === 3) return <Text style={{ fontSize: 26 }}>🥉</Text>;
    return (
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: "rgba(255,255,255,0.07)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#9CA3AF", fontSize: 13, fontWeight: "700" }}>#{position}</Text>
      </View>
    );
  };

  const SectionHeader = ({ title, icon, color }) => (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: `${color}18`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={15} color={color} />
      </View>
      <Text style={{ fontFamily: "MontserratAlternates_600SemiBold", color: "#fff", fontSize: 16 }}>{title}</Text>
    </View>
  );

  const FamilyMemberCard = ({ member }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 20,
        marginBottom: 10,
        backgroundColor: member.isMe ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: member.isMe ? "rgba(6,182,212,0.35)" : "rgba(255,255,255,0.07)",
        shadowColor: member.isMe ? "#06B6D4" : "#000",
        shadowOffset: { width: 0, height: member.isMe ? 4 : 2 },
        shadowOpacity: member.isMe ? 0.2 : 0.15,
        shadowRadius: member.isMe ? 8 : 4,
      }}
    >
      <View style={{ width: 36, alignItems: "center", marginRight: 12 }}>
        <RankBadge position={member.position} />
      </View>
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          overflow: "hidden",
          marginRight: 14,
        }}
      >
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={{ width: 54, height: 54 }} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={["#0E4D6E", "#0E2A4A"]}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="person" size={20} color="#06B6D4" />
          </LinearGradient>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "MontserratAlternates_600SemiBold",
            color: member.isMe ? "#22D3EE" : "#fff",
            fontSize: 15,
            marginBottom: 3,
          }}
        >
          {member.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="footsteps" size={12} color="#6B7280" />
            <Text style={{ color: "#6B7280", fontSize: 12 }}>
              {selectedTimeframe === "Today" ? member.todaySteps.toLocaleString() : member.weeklySteps.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const FamilyLeaderboardCard = ({ family }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 20,
        marginBottom: 10,
        backgroundColor: family.isYours ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: family.isYours ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.07)",
        shadowColor: family.isYours ? "#8B5CF6" : "#000",
        shadowOffset: { width: 0, height: family.isYours ? 4 : 2 },
        shadowOpacity: family.isYours ? 0.2 : 0.15,
        shadowRadius: family.isYours ? 8 : 4,
      }}
    >
      <View style={{ width: 36, alignItems: "center", marginRight: 12 }}>
        <RankBadge position={family.rank} />
      </View>
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          overflow: "hidden",
          marginRight: 14,
        }}
      >
        {(() => {
          // For your own family, prefer the selected avatar from the avatars API
          const imgUrl = family.isYours
            ? familyAvatarUrl || buildImageUrl(family.family_avatar)
            : buildImageUrl(family.family_avatar);
          return imgUrl ? (
            <Image source={{ uri: imgUrl }} style={{ width: 54, height: 54 }} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={["#3A2D6E", "#262135"]}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="people" size={20} color="#8B5CF6" />
            </LinearGradient>
          );
        })()}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "MontserratAlternates_600SemiBold",
            color: family.isYours ? "#C4B5FD" : "#fff",
            fontSize: 15,
            marginBottom: 3,
          }}
        >
          {family.family_name}
          {family.isYours && <Text style={{ color: "#8B5CF6", fontSize: 11 }}> (you)</Text>}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="footsteps" size={12} color="#6B7280" />
          <Text style={{ color: "#6B7280", fontSize: 12 }}>{family.total_steps?.toLocaleString() || 0} steps</Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>{formatSteps(family.total_steps || 0)}</Text>
        <Text style={{ color: "#6B7280", fontSize: 10, marginTop: 2 }}>total</Text>
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
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
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
                <Text style={{ fontFamily: "MontserratAlternates_600SemiBold", color: "#fff", fontSize: 22 }}>
                  Leaderboard
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(gfit)/challenges")}
                activeOpacity={0.75}
                style={{ marginRight: 10 }}
              >
                <LinearGradient
                  colors={["#F59E0B", "#F97316"]}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#F59E0B",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4.65,
                  }}
                >
                  <Ionicons name="trophy" size={17} color="white" />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={loadActiveChallenge}
                activeOpacity={0.75}
                disabled={getActiveChallengemutation.isPending || getFamiliesLeaderboardMutation.isPending}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "rgba(6,182,212,0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(6,182,212,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="refresh" size={17} color="#06B6D4" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            {getActiveChallengemutation.isPending ? (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#06B6D4", fontSize: 14 }}>Loading challenge…</Text>
              </View>
            ) : activeChallenge ? (
              <View
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  marginBottom: 20,
                  shadowColor: "#06B6D4",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <LinearGradient
                  colors={["rgba(6,182,212,0.15)", "rgba(59,130,246,0.12)"]}
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(6,182,212,0.25)",
                    borderRadius: 20,
                    padding: 18,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text
                        style={{
                          fontFamily: "MontserratAlternates_600SemiBold",
                          color: "#22D3EE",
                          fontSize: 17,
                          marginBottom: 4,
                        }}
                      >
                        {activeChallenge.title}
                      </Text>
                      <Text style={{ color: "#94A3B8", fontSize: 13, lineHeight: 18 }}>{activeChallenge.goal}</Text>
                    </View>
                    <LinearGradient
                      colors={activeChallenge.isExpired ? ["#7F1D1D", "#991B1B"] : ["#065F46", "#059669"]}
                      style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
                        {activeChallenge.isExpired ? "EXPIRED" : "● ACTIVE"}
                      </Text>
                    </LinearGradient>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 16,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: "rgba(6,182,212,0.15)",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="time-outline" size={14} color="#06B6D4" />
                      <Text style={{ color: "#94A3B8", fontSize: 13 }}>
                        {activeChallenge.daysLeft > 0 ? `${activeChallenge.daysLeft} days left` : "Ended"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="people-outline" size={14} color="#06B6D4" />
                      <Text style={{ color: "#94A3B8", fontSize: 13 }}>{familyStats.totalFamilies} families</Text>
                    </View>
                    {activeChallengeData?.completion_xp ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="star" size={14} color="#10B981" />
                        <Text style={{ color: "#34D399", fontSize: 13, fontWeight: "700" }}>
                          +{activeChallengeData.completion_xp} XP
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </LinearGradient>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: 32,
                  marginBottom: 20,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    backgroundColor: "rgba(245,158,11,0.08)",
                    borderWidth: 1,
                    borderColor: "rgba(245,158,11,0.15)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <Ionicons name="trophy-outline" size={30} color="#F59E0B" />
                </View>
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600", marginBottom: 6 }}>
                  No Active Challenge
                </Text>
                <Text
                  style={{
                    color: "#6B7280",
                    fontSize: 13,
                    textAlign: "center",
                    marginBottom: 18,
                  }}
                >
                  Join a challenge to compete on the leaderboard
                </Text>
                <TouchableOpacity onPress={() => router.push("/(gfit)/challenges")}>
                  <LinearGradient
                    colors={["#06B6D4", "#3B82F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 14,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Browse Challenges</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {activeChallenge && (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: 18,
                  marginBottom: 20,
                }}
              >
                <SectionHeader title="Your Family Progress" icon="pulse-outline" color="#8B5CF6" />

                <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
                  {[
                    {
                      label: "Position",
                      value: `#${familyStats.position}`,
                      sub: `of ${familyStats.totalFamilies}`,
                      color: "#8B5CF6",
                    },
                    {
                      label: "Total Steps",
                      value: formatSteps(familyStats.totalSteps),
                      sub: "steps",
                      color: "#06B6D4",
                    },
                    {
                      label: "Progress",
                      value: `${familyStats.weeklyProgress}%`,
                      sub: "complete",
                      color: "#10B981",
                    },
                  ].map(({ label, value, sub, color }) => (
                    <View
                      key={label}
                      style={{
                        flex: 1,
                        backgroundColor: `${color}10`,
                        borderWidth: 1,
                        borderColor: `${color}28`,
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <Text
                        style={{
                          color,
                          fontSize: 10,
                          fontWeight: "600",
                          marginBottom: 4,
                        }}
                      >
                        {label}
                      </Text>
                      <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{value}</Text>
                      <Text style={{ color: "#6B7280", fontSize: 10, marginTop: 2 }}>{sub}</Text>
                    </View>
                  ))}
                </View>

                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: "#6B7280", fontSize: 12 }}>Challenge Goal</Text>
                    <Text style={{ color: "#06B6D4", fontSize: 12, fontWeight: "700" }}>
                      {familyStats.weeklyProgress}%
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={["#06B6D4", "#8B5CF6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        width: `${familyStats.weeklyProgress}%`,
                      }}
                    />
                  </View>
                </View>
              </View>
            )}

            {activeChallenge && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderRadius: 16,
                    padding: 4,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.06)",
                    marginBottom: 18,
                  }}
                >
                  {timeframes.map((timeframe) => (
                    <TouchableOpacity
                      key={timeframe}
                      onPress={() => setSelectedTimeframe(timeframe)}
                      style={{ flex: 1 }}
                      activeOpacity={0.8}
                    >
                      {selectedTimeframe === timeframe ? (
                        <LinearGradient
                          colors={["#0E7490", "#2563EB"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            paddingVertical: 9,
                            borderRadius: 12,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "700",
                              fontSize: 13,
                            }}
                          >
                            {timeframe}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View
                          style={{
                            paddingVertical: 9,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#6B7280",
                              fontWeight: "600",
                              fontSize: 13,
                            }}
                          >
                            {timeframe}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ marginBottom: 20 }}>
                  <SectionHeader title="Family Members" icon="person-outline" color="#06B6D4" />
                  {familyMembers.length > 0 ? (
                    familyMembers.map((member) => <FamilyMemberCard key={member.id} member={member} />)
                  ) : (
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.07)",
                        borderRadius: 16,
                        padding: 24,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#6B7280", fontSize: 14 }}>No family members found</Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {activeChallenge && (
              <View style={{ marginBottom: 20 }}>
                <SectionHeader title="All Families" icon="people-outline" color="#F59E0B" />
                {getFamiliesLeaderboardMutation.isPending ? (
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.07)",
                      borderRadius: 16,
                      padding: 24,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#6B7280", fontSize: 14 }}>Loading standings…</Text>
                  </View>
                ) : processedFamiliesLeaderboard.length > 0 ? (
                  processedFamiliesLeaderboard.map((family) => (
                    <FamilyLeaderboardCard key={family.family_id} family={family} />
                  ))
                ) : (
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.03)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.07)",
                      borderRadius: 16,
                      padding: 24,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#6B7280", fontSize: 14 }}>No families participating yet</Text>
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
