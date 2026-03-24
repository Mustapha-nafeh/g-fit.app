import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalContext";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { showToast } from "../../constants";
import {
  useGetProfile,
  useGetFamilyMembers,
  useUpdateFamilyInfo,
  useUpdateFamilyProfile,
  useUpdateMemberProfile,
  useAddFamilyMember,
  useGetUnlockedAvatars,
  useSelectAvatar,
  useGetLevels,
} from "../../api/profile";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { STORAGE_BASE_URL } from "../../config";

export default function ProfilePage() {
  const { member, setMember } = useGlobalContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFamilyEditModal, setShowFamilyEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberImage, setNewMemberImage] = useState(null);
  const [familyName, setFamilyName] = useState("");
  const [familyImage, setFamilyImage] = useState("");
  const [familyAvatar, setFamilyAvatar] = useState("");
  const [familyEmail, setFamilyEmail] = useState("");
  const [familyPhone, setFamilyPhone] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);

  // API hooks
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile();
  const { data: familyMembersData, isLoading: membersLoading, refetch: refetchMembers } = useGetFamilyMembers();
  const { data: avatarsData, isLoading: avatarsLoading, refetch: refetchAvatars } = useGetUnlockedAvatars();
  const { data: levelsData, isLoading: levelsLoading } = useGetLevels();
  const updateFamilyInfoMutation = useUpdateFamilyInfo();
  const updateFamilyProfileMutation = useUpdateFamilyProfile();
  const updateMemberProfileMutation = useUpdateMemberProfile();
  const addFamilyMemberMutation = useAddFamilyMember();
  const selectAvatarMutation = useSelectAvatar();

  // XP system data — use API fields directly
  const familyXP = profileData?.data?.xp ?? 0;
  const currentLevel = profileData?.data?.level ?? 1;
  const xpToNextLevel = profileData?.data?.xp_to_next_level ?? 0; // total XP needed to reach next level
  const remainingXP = profileData?.data?.remaining_xp ?? xpToNextLevel; // XP still needed from now
  const maxXP = xpToNextLevel; // threshold for the bar
  const xpProgress = xpToNextLevel > 0 ? ((xpToNextLevel - remainingXP) / xpToNextLevel) * 100 : 100;

  useEffect(() => {
    if (profileData?.data) {
      console.log("Profile data received:", profileData.data);
      setFamilyName(profileData.data.name || "My Family");
      setFamilyImage(profileData.data.family_image || "");
      setFamilyAvatar(profileData.data.avatar || "👨‍👩‍👧‍👦");
      setFamilyEmail(profileData.data.email || "");
      setFamilyPhone(profileData.data.phone || "");
    }
  }, [profileData]);

  const handleEditMember = (memberData) => {
    setEditingMember(memberData);
    setEditName(memberData.username || "");
    setEditImage(memberData.image ? { uri: `${STORAGE_BASE_URL}/${memberData.image}` } : null);
    setShowEditModal(true);
  };

  const pickImage = async (onSelect) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("error", "Permission Denied", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      onSelect(result.assets[0]);
    }
  };
  const handleSaveMember = async () => {
    if (!editName.trim()) {
      showToast("error", "Error", "Please enter a name");
      return;
    }

    if (!editingMember?.token_key) {
      showToast("error", "Error", "Member token not found. Please try again.");
      return;
    }

    try {
      await updateMemberProfileMutation.mutateAsync({
        token_key: editingMember.token_key,
        username: editName.trim(),
        // only pass image if user picked a new one (has a local uri)
        image: editImage?.uri?.startsWith("file://") ? editImage : undefined,
      });

      setShowEditModal(false);
      setEditingMember(null);
      setEditName("");
      setEditImage(null);
      showToast("success", "Success", "Member updated successfully!");
      refetchMembers();
    } catch (error) {
      console.error("Error updating member:", error);
      showToast("error", "Error", "Failed to update member. Please try again.");
    }
  };

  const handleEditFamily = () => {
    setShowFamilyEditModal(true);
  };

  const handleSelectFamilyAvatar = async (avatarId) => {
    try {
      await selectAvatarMutation.mutateAsync({ avatar_id: avatarId });

      // Find avatar name for success message
      const selectedAvatar = avatarsData?.data?.avatars?.find((a) => a.id === avatarId);

      setFamilyAvatar(avatarId.toString());
      refetchProfile();
      refetchAvatars();
      showToast("success", "Success", `${selectedAvatar?.name || "Avatar"} is now your family avatar! 🎉`);
    } catch (error) {
      console.error("Error selecting family avatar:", error);
      showToast("error", "Error", "Failed to select avatar. Please try again.");
    }
  };

  const handleSaveFamily = async () => {
    if (!familyName.trim()) {
      showToast("error", "Error", "Please enter a family name");
      return;
    }

    try {
      // Update family profile with name, email, and phone
      await updateFamilyProfileMutation.mutateAsync({
        name: familyName.trim(),
        email: familyEmail.trim(),
        phone: familyPhone.trim(),
      });

      setShowFamilyEditModal(false);
      showToast("success", "Success", "Family profile updated successfully!");
      refetchProfile();
    } catch (error) {
      console.error("Error updating family profile:", error);
      showToast("error", "Error", "Failed to update family profile. Please try again.");
    }
  };

  const handleAddMember = () => {
    setNewMemberName("");
    setNewMemberImage(null);
    setShowAddMemberModal(true);
  };

  const handleSaveNewMember = async () => {
    if (!newMemberName.trim()) {
      showToast("error", "Error", "Please enter a name for the new member");
      return;
    }

    // Check for duplicate names
    const existingNames = familyMembersData?.data?.map((member) => member.username.toLowerCase()) || [];
    if (existingNames.includes(newMemberName.trim().toLowerCase())) {
      showToast("error", "Error", "A family member with this name already exists");
      return;
    }

    try {
      await addFamilyMemberMutation.mutateAsync({
        username: newMemberName.trim(),
        image: newMemberImage ?? undefined,
      });

      setShowAddMemberModal(false);
      setNewMemberName("");
      setNewMemberImage(null);
      showToast("success", "Success", `${newMemberName.trim()} has been added to your family!`);
      refetchMembers();
    } catch (error) {
      console.error("Error adding family member:", error);
      showToast("error", "Error", "Failed to add family member. Please try again.");
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchMembers(), refetchAvatars()]);
    setRefreshing(false);
  };

  const confirmLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      await SecureStore.deleteItemAsync("token_key");
      await SecureStore.deleteItemAsync("member");
      await SecureStore.deleteItemAsync("selectedApp");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setMember(null);
      router.replace("/(auth)/login");
    }
  };

  // XP Progress Component
  const XPProgressBar = () => {
    if (profileLoading) {
      return (
        <View className="mb-6">
          <View className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30">
            <View className="flex-row items-center justify-center">
              <View className="w-4 h-4 bg-purple-500 rounded-full mr-2 animate-pulse" />
              <Text className="text-gray-400">Loading profile...</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="mb-6">
        <TouchableOpacity
          className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30"
          onPress={() => setShowLevelsModal(true)}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-purple-500/20 rounded-lg items-center justify-center mr-2">
                <Ionicons name="star" size={14} color="#8B5CF6" />
              </View>
              <Text className="text-white font-semibold text-base">Family XP</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-purple-400 text-sm font-bold">Level {currentLevel}</Text>
              <Text className="text-gray-400 text-sm ml-1">
                • {familyXP.toLocaleString()} / {maxXP.toLocaleString()} XP
              </Text>
            </View>
          </View>

          <View className="bg-gray-700 h-3 rounded-full overflow-hidden mb-3">
            <LinearGradient
              colors={["#8B5CF6", "#A855F7", "#C084FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full rounded-full"
              style={{
                width: `${Math.min(xpProgress, 100)}%`,
                shadowColor: "#8B5CF6",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
              }}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="trophy" size={14} color="#F59E0B" style={{ marginRight: 4 }} />
              <Text className="text-gray-300 text-sm">{remainingXP.toLocaleString()} XP to next level</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-purple-400 text-sm font-medium">
                {profileData?.data?.completion_xp || 0} XP today
              </Text>
              <Ionicons name="trending-up" size={14} color="#10B981" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

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
              onRefresh={handleRefresh}
              tintColor="#8B5CF6"
              colors={["#8B5CF6"]}
            />
          }
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-2xl">
                Family Profile
              </Text>
              <TouchableOpacity onPress={handleLogout}>
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
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Family XP Bar */}
            <XPProgressBar />

            {/* Family Info Card */}
            <View
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-5 mb-6"
              style={{
                shadowColor: "#8B5CF6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
            >
              {profileLoading ? (
                <View className="flex-row items-center justify-center py-4">
                  <View className="w-4 h-4 bg-purple-500 rounded-full mr-2 animate-pulse" />
                  <Text className="text-gray-400">Loading family info...</Text>
                </View>
              ) : (
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mr-4 overflow-hidden">
                      {avatarsData?.data?.avatars?.find((avatar) => avatar.is_selected)?.image ? (
                        <Image
                          source={{
                            uri: `${STORAGE_BASE_URL}/${
                              avatarsData.data.avatars.find((avatar) => avatar.is_selected).image
                            }`,
                          }}
                          className="w-10 h-10"
                          resizeMode="contain"
                        />
                      ) : (
                        <Text className="text-2xl">👨‍👩‍👧‍👦</Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-xl font-bold">{familyName}</Text>
                      <Text className="text-purple-300 text-sm">Level {currentLevel} Family</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={handleEditFamily}
                    className="bg-cyan-500/20 border border-cyan-500/30 px-3 py-2 rounded-xl"
                  >
                    <Text className="text-cyan-400 text-sm font-medium">Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Family Members Section */}
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-white text-xl font-bold">Family Members</Text>
                {familyMembersData?.data && familyMembersData.data.length > 0 && (
                  <View className="bg-purple-500/20 px-2 py-1 rounded-full ml-2">
                    <Text className="text-purple-400 text-xs font-medium">{familyMembersData.data.length}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={handleAddMember}
                className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-xl flex-row items-center"
              >
                <Ionicons name="person-add" size={16} color="#10B981" style={{ marginRight: 4 }} />
                <Text className="text-green-400 text-sm font-medium">Add Member</Text>
              </TouchableOpacity>
            </View>

            {membersLoading ? (
              <View className="bg-gray-800/50 rounded-2xl p-8 items-center">
                <View className="flex-row items-center justify-center mb-2">
                  <View className="w-4 h-4 bg-cyan-500 rounded-full mr-2 animate-pulse" />
                  <View className="w-4 h-4 bg-purple-500 rounded-full mr-2 animate-pulse" />
                  <View className="w-4 h-4 bg-pink-500 rounded-full animate-pulse" />
                </View>
                <Text className="text-gray-400">Loading family members...</Text>
              </View>
            ) : (
              <View className="space-y-3">
                {familyMembersData?.data?.map((memberData) => (
                  <View
                    key={memberData.id}
                    className="bg-gray-800/50 backdrop-blur border border-gray-700/30 rounded-2xl p-4"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        {memberData.image ? (
                          <Image
                            source={{ uri: `${STORAGE_BASE_URL}/${memberData.image}` }}
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 16,
                              marginRight: 14,
                            }}
                            resizeMode="cover"
                          />
                        ) : (
                          <LinearGradient
                            colors={["#1E3A5F", "#1a2a4a"]}
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 16,
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 14,
                            }}
                          >
                            <Text style={{ color: "#93C5FD", fontSize: 18, fontWeight: "700" }}>
                              {memberData.username?.charAt(0).toUpperCase() || "?"}
                            </Text>
                          </LinearGradient>
                        )}
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <Text className="text-white text-lg font-semibold">{memberData.username}</Text>
                            {memberData.id === member?.id && (
                              <View className="bg-green-500/20 px-2 py-0.5 rounded-full ml-2">
                                <Text className="text-green-400 text-xs font-medium">You</Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-gray-400 text-sm">Family Member</Text>
                        </View>
                      </View>

                      {memberData.id === member?.id && (
                        <TouchableOpacity
                          onPress={() => handleEditMember(memberData)}
                          className="bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 rounded-xl"
                        >
                          <Text className="text-cyan-400 text-sm font-medium">Edit</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                {(!familyMembersData?.data || familyMembersData.data.length === 0) && (
                  <View className="bg-gray-800/30 rounded-2xl p-6 items-center">
                    <Ionicons name="people-outline" size={32} color="#6B7280" />
                    <Text className="text-gray-400 text-center mt-2 mb-1">No family members yet</Text>
                    <Text className="text-gray-500 text-center text-xs mb-4">
                      Start building your family by adding your first member
                    </Text>
                    <TouchableOpacity
                      onPress={handleAddMember}
                      className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-xl flex-row items-center"
                    >
                      <Ionicons name="person-add" size={16} color="#10B981" style={{ marginRight: 4 }} />
                      <Text className="text-green-400 text-sm font-medium">Add First Member</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Avatar Collection Section */}
          <View className="px-6 mb-8">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="text-white text-xl font-bold">Avatar Collection</Text>
                <Text className="text-gray-500 text-xs mt-0.5">Tap an unlocked avatar to equip it</Text>
              </View>
              {!avatarsLoading && (
                <View className="bg-purple-500/15 border border-purple-500/30 px-3 py-1.5 rounded-full flex-row items-center">
                  <Ionicons name="shield-checkmark" size={12} color="#A855F7" style={{ marginRight: 4 }} />
                  <Text className="text-purple-400 text-xs font-semibold">
                    {avatarsData?.data?.avatars?.filter((a) => a.is_unlocked).length || 0} /{" "}
                    {avatarsData?.data?.avatars?.length || 0}
                  </Text>
                </View>
              )}
            </View>

            {avatarsLoading ? (
              <View className="bg-gray-800/50 rounded-3xl p-10 items-center">
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  ))}
                </View>
                <Text className="text-gray-400 mt-3 text-sm">Loading avatars...</Text>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                {/* ── Active Avatar Hero ── */}
                {avatarsData?.data?.avatars?.find((a) => a.is_selected) &&
                  (() => {
                    const active = avatarsData.data.avatars.find((a) => a.is_selected);
                    return (
                      <LinearGradient
                        colors={["#1E1035", "#2D1B5E", "#1a0f3a"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 24, borderWidth: 1, borderColor: "rgba(139,92,246,0.4)" }}
                      >
                        <View className="p-5 flex-row items-center" style={{ gap: 16 }}>
                          {/* Avatar image with glow ring */}
                          <View style={{ position: "relative" }}>
                            <View
                              style={{
                                width: 72,
                                height: 72,
                                borderRadius: 36,
                                backgroundColor: "#8B5CF6",
                                shadowColor: "#8B5CF6",
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.8,
                                shadowRadius: 16,
                                elevation: 10,
                                padding: 3,
                              }}
                            >
                              <Image
                                source={{ uri: `${STORAGE_BASE_URL}/${active.image}` }}
                                style={{ width: "100%", height: "100%", borderRadius: 34 }}
                                resizeMode="cover"
                              />
                            </View>
                            <View
                              style={{
                                position: "absolute",
                                bottom: -2,
                                right: -2,
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: "#10B981",
                                borderWidth: 2,
                                borderColor: "#1E1035",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Ionicons name="checkmark" size={11} color="white" />
                            </View>
                          </View>

                          <View className="flex-1">
                            <View className="flex-row items-center" style={{ gap: 8 }}>
                              <Text className="text-white text-lg font-bold">{active.name}</Text>
                              <View className="bg-green-500/20 px-2 py-0.5 rounded-full">
                                <Text className="text-green-400 text-xs font-semibold">Active</Text>
                              </View>
                            </View>
                            <Text className="text-purple-300 text-sm mt-0.5">Your family's current avatar</Text>
                            <View className="flex-row items-center mt-2" style={{ gap: 6 }}>
                              <Ionicons name="star" size={12} color="#F59E0B" />
                              <Text className="text-yellow-400 text-xs">
                                Unlocked at Level {active.required_level || 1}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    );
                  })()}

                {/* ── Unlocked Avatars ── */}
                {avatarsData?.data?.avatars?.filter((a) => a.is_unlocked).length > 0 && (
                  <View>
                    <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
                      <View className="w-2 h-2 bg-green-400 rounded-full" />
                      <Text className="text-green-400 text-sm font-semibold">Unlocked</Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 12, paddingRight: 4 }}
                    >
                      {avatarsData.data.avatars
                        .filter((a) => a.is_unlocked)
                        .map((avatar) => {
                          const isActive = avatar.is_selected;
                          const isPending = selectAvatarMutation.isPending;
                          return (
                            <TouchableOpacity
                              key={`unlocked-${avatar.id}`}
                              onPress={() => !isActive && handleSelectFamilyAvatar(avatar.id)}
                              disabled={isPending || isActive}
                              activeOpacity={0.75}
                            >
                              <View
                                style={{
                                  width: 80,
                                  borderRadius: 20,
                                  overflow: "hidden",
                                  borderWidth: isActive ? 2 : 1,
                                  borderColor: isActive ? "#8B5CF6" : "rgba(75,85,99,0.4)",
                                  shadowColor: isActive ? "#8B5CF6" : "transparent",
                                  shadowOffset: { width: 0, height: 0 },
                                  shadowOpacity: isActive ? 0.6 : 0,
                                  shadowRadius: 10,
                                  elevation: isActive ? 8 : 0,
                                }}
                              >
                                <LinearGradient
                                  colors={isActive ? ["#1E1035", "#2D1B5E"] : ["#1F2937", "#111827"]}
                                  style={{ padding: 10, alignItems: "center", gap: 8 }}
                                >
                                  <View style={{ position: "relative", width: 52, height: 52 }}>
                                    <Image
                                      source={{ uri: `${STORAGE_BASE_URL}/${avatar.image}` }}
                                      style={{ width: 52, height: 52, borderRadius: 14 }}
                                      resizeMode="cover"
                                    />
                                    {isActive && (
                                      <View
                                        style={{
                                          position: "absolute",
                                          top: -4,
                                          right: -4,
                                          width: 18,
                                          height: 18,
                                          borderRadius: 9,
                                          backgroundColor: "#8B5CF6",
                                          borderWidth: 1.5,
                                          borderColor: "#1E1035",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Ionicons name="checkmark" size={10} color="white" />
                                      </View>
                                    )}
                                  </View>
                                  <Text
                                    style={{
                                      color: isActive ? "#C4B5FD" : "#9CA3AF",
                                      fontSize: 10,
                                      fontWeight: "600",
                                      textAlign: "center",
                                    }}
                                    numberOfLines={1}
                                  >
                                    {avatar.name}
                                  </Text>
                                </LinearGradient>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                    </ScrollView>
                  </View>
                )}

                {/* ── Locked Avatars ── */}
                {avatarsData?.data?.avatars?.filter((a) => !a.is_unlocked).length > 0 && (
                  <View>
                    {/* Section header — make it feel premium */}
                    <LinearGradient
                      colors={["rgba(245,158,11,0.12)", "rgba(251,191,36,0.06)", "transparent"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        borderRadius: 16,
                        padding: 12,
                        marginBottom: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <LinearGradient
                          colors={["#F59E0B", "#FBBF24"]}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="trophy" size={14} color="#1C1009" />
                        </LinearGradient>
                        <View>
                          <Text style={{ color: "#FBBF24", fontSize: 13, fontWeight: "700" }}>Exclusive Avatars</Text>
                          <Text style={{ color: "#92400E", fontSize: 10 }}>Level up to claim them</Text>
                        </View>
                      </View>
                      <View
                        style={{
                          backgroundColor: "rgba(245,158,11,0.2)",
                          borderRadius: 20,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderWidth: 1,
                          borderColor: "rgba(245,158,11,0.3)",
                        }}
                      >
                        <Text style={{ color: "#FBBF24", fontSize: 10, fontWeight: "700" }}>
                          {avatarsData?.data?.avatars?.filter((a) => !a.is_unlocked).length} locked
                        </Text>
                      </View>
                    </LinearGradient>

                    {/* Locked cards — fully visible, desirable */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 12, paddingRight: 8 }}
                    >
                      {avatarsData.data.avatars
                        .filter((a) => !a.is_unlocked)
                        .map((avatar, index) => {
                          const isNext = index === 0;
                          return (
                            <View
                              key={`locked-${avatar.id}`}
                              style={{
                                width: 90,
                                borderRadius: 22,
                                overflow: "hidden",
                                borderWidth: isNext ? 1.5 : 1,
                                borderColor: isNext ? "rgba(245,158,11,0.6)" : "rgba(75,85,99,0.35)",
                                shadowColor: isNext ? "#F59E0B" : "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: isNext ? 0.35 : 0.15,
                                shadowRadius: isNext ? 12 : 4,
                                elevation: isNext ? 8 : 2,
                              }}
                            >
                              <LinearGradient
                                colors={isNext ? ["#1C1009", "#2D1A0A", "#1C1009"] : ["#161B26", "#0F1520"]}
                                style={{ padding: 10, alignItems: "center", gap: 8 }}
                              >
                                {/* Avatar image — full visibility, just dimmed slightly */}
                                <View style={{ position: "relative", width: 60, height: 60 }}>
                                  <Image
                                    source={{ uri: `${STORAGE_BASE_URL}/${avatar.image}` }}
                                    style={{ width: 60, height: 60, borderRadius: 16 }}
                                    resizeMode="cover"
                                  />
                                  {/* Subtle dark tint — image stays visible */}
                                  <View
                                    style={{
                                      position: "absolute",
                                      inset: 0,
                                      width: 60,
                                      height: 60,
                                      borderRadius: 16,
                                      backgroundColor: "rgba(0,0,0,0.28)",
                                    }}
                                  />
                                  {/* Level badge — top left */}
                                  <LinearGradient
                                    colors={isNext ? ["#F59E0B", "#D97706"] : ["#374151", "#1F2937"]}
                                    style={{
                                      position: "absolute",
                                      top: -5,
                                      left: -5,
                                      borderRadius: 8,
                                      paddingHorizontal: 5,
                                      paddingVertical: 2,
                                      borderWidth: 1,
                                      borderColor: isNext ? "rgba(251,191,36,0.5)" : "rgba(75,85,99,0.4)",
                                    }}
                                  >
                                    <Text
                                      style={{ color: isNext ? "#1C1009" : "#9CA3AF", fontSize: 8, fontWeight: "800" }}
                                    >
                                      LVL {avatar.required_level}
                                    </Text>
                                  </LinearGradient>

                                  {/* Lock icon — bottom right, small */}
                                  <View
                                    style={{
                                      position: "absolute",
                                      bottom: -4,
                                      right: -4,
                                      width: 20,
                                      height: 20,
                                      borderRadius: 10,
                                      backgroundColor: isNext ? "#F59E0B" : "#374151",
                                      borderWidth: 1.5,
                                      borderColor: isNext ? "#1C1009" : "#111827",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Ionicons name="lock-closed" size={9} color={isNext ? "#1C1009" : "#6B7280"} />
                                  </View>
                                </View>

                                {/* Name */}
                                <Text
                                  style={{
                                    color: isNext ? "#FDE68A" : "#6B7280",
                                    fontSize: 10,
                                    fontWeight: "700",
                                    textAlign: "center",
                                  }}
                                  numberOfLines={1}
                                >
                                  {avatar.name}
                                </Text>
                              </LinearGradient>
                            </View>
                          );
                        })}
                    </ScrollView>

                    {/* Next unlock teaser — bigger and bolder */}
                    {(() => {
                      const next = avatarsData?.data?.avatars
                        ?.filter((a) => !a.is_unlocked)
                        .sort((a, b) => a.required_level - b.required_level)[0];
                      if (!next) return null;
                      const lvlsAway = next.required_level - currentLevel;
                      return (
                        <LinearGradient
                          colors={["rgba(245,158,11,0.12)", "rgba(245,158,11,0.06)"]}
                          style={{
                            marginTop: 12,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: "rgba(245,158,11,0.25)",
                            overflow: "hidden",
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 12 }}>
                            {/* Next avatar preview */}
                            <View style={{ position: "relative" }}>
                              <Image
                                source={{ uri: `${STORAGE_BASE_URL}/${next.image}` }}
                                style={{ width: 52, height: 52, borderRadius: 14 }}
                                resizeMode="cover"
                              />
                              <View
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  width: 52,
                                  height: 52,
                                  borderRadius: 14,
                                  backgroundColor: "rgba(0,0,0,0.25)",
                                }}
                              />
                              <LinearGradient
                                colors={["#F59E0B", "#D97706"]}
                                style={{
                                  position: "absolute",
                                  top: -5,
                                  right: -5,
                                  width: 20,
                                  height: 20,
                                  borderRadius: 10,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderWidth: 1.5,
                                  borderColor: "#1C1009",
                                }}
                              >
                                <Ionicons name="flash" size={10} color="#1C1009" />
                              </LinearGradient>
                            </View>

                            <View style={{ flex: 1, gap: 3 }}>
                              <Text
                                style={{
                                  color: "#9CA3AF",
                                  fontSize: 10,
                                  fontWeight: "600",
                                  textTransform: "uppercase",
                                  letterSpacing: 0.5,
                                }}
                              >
                                Next Unlock
                              </Text>
                              <Text style={{ color: "#FDE68A", fontSize: 15, fontWeight: "800" }}>{next.name}</Text>
                              <Text style={{ color: "#92400E", fontSize: 11 }}>
                                {lvlsAway <= 0
                                  ? "🔥 You're so close!"
                                  : lvlsAway === 1
                                  ? "⚡ Just 1 more level!"
                                  : `${lvlsAway} levels away`}
                              </Text>
                            </View>

                            {/* Level pill */}
                            <LinearGradient colors={["#F59E0B", "#D97706"]} style={{ borderRadius: 14, padding: 1 }}>
                              <View
                                style={{
                                  backgroundColor: "#1C1009",
                                  borderRadius: 13,
                                  paddingHorizontal: 12,
                                  paddingVertical: 6,
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    color: "#FBBF24",
                                    fontSize: 9,
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Reach
                                </Text>
                                <Text style={{ color: "#FDE68A", fontSize: 18, fontWeight: "800", lineHeight: 22 }}>
                                  {next.required_level}
                                </Text>
                              </View>
                            </LinearGradient>
                          </View>
                        </LinearGradient>
                      );
                    })()}
                  </View>
                )}

                {/* All unlocked celebration */}
                {avatarsData?.data?.avatars?.filter((a) => !a.is_unlocked).length === 0 && (
                  <LinearGradient
                    colors={["#1A3A2A", "#0F2A1A"]}
                    style={{
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: "rgba(16,185,129,0.3)",
                      padding: 16,
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>🏆</Text>
                    <Text className="text-green-400 font-bold text-base">Collection Complete!</Text>
                    <Text className="text-gray-500 text-xs text-center">You've unlocked every avatar. Legendary.</Text>
                  </LinearGradient>
                )}
              </View>
            )}
          </View>

          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>

      {/* Edit Member Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View className="flex-1 bg-black/50 justify-center px-4">
            <View
              className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-700/50"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.5,
                shadowRadius: 25,
                elevation: 25,
              }}
            >
              {/* Modal Header */}
              <LinearGradient
                colors={["#06B6D4", "#3B82F6", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-6 py-5"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-xl">
                      Edit Profile
                    </Text>
                    <Text className="text-white/80 text-sm">Update your name and photo</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowEditModal(false)}
                    className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl items-center justify-center"
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              <View className="px-6 py-6">
                {/* Photo picker */}
                <View className="items-center mb-6">
                  <TouchableOpacity
                    onPress={() => pickImage(setEditImage)}
                    activeOpacity={0.8}
                    style={{ position: "relative" }}
                  >
                    {editImage ? (
                      <Image
                        source={{ uri: editImage.uri ?? editImage }}
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 28,
                          borderWidth: 2,
                          borderColor: "rgba(99,179,237,0.5)",
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={["#1E3A5F", "#1a2a4a"]}
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 28,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1.5,
                          borderColor: "rgba(99,179,237,0.3)",
                        }}
                      >
                        <Text style={{ color: "#93C5FD", fontSize: 32, fontWeight: "700" }}>
                          {editName?.charAt(0).toUpperCase() || "?"}
                        </Text>
                      </LinearGradient>
                    )}
                    {/* Camera badge */}
                    <LinearGradient
                      colors={["#06B6D4", "#3B82F6"]}
                      style={{
                        position: "absolute",
                        bottom: -4,
                        right: -4,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: "#111827",
                      }}
                    >
                      <Ionicons name="camera" size={14} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                  <Text className="text-gray-500 text-xs mt-3">Tap to change photo</Text>
                </View>

                {/* Name Input */}
                <View className="mb-6">
                  <Text className="text-white font-semibold text-base mb-3">Name</Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Enter your name"
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white text-base"
                    autoFocus
                  />
                </View>

                {/* Action Buttons */}
                <View className="flex-row" style={{ gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-700/50 py-4 rounded-xl"
                  >
                    <Text className="text-gray-300 text-center font-semibold">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveMember}
                    className="flex-1"
                    disabled={updateMemberProfileMutation.isPending}
                  >
                    <LinearGradient
                      colors={["#06B6D4", "#3B82F6"]}
                      className="py-4 rounded-xl"
                      style={{
                        shadowColor: "#06B6D4",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        opacity: updateMemberProfileMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      <Text className="text-white text-center font-bold">
                        {updateMemberProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Family Edit Modal */}
      <Modal
        visible={showFamilyEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFamilyEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View
            className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-700/50 max-h-[80%]"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.5,
              shadowRadius: 25,
              elevation: 25,
            }}
          >
            {/* Modal Header */}
            <LinearGradient
              colors={["#8B5CF6", "#EC4899", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-6 py-5"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-xl">
                    Edit Family Profile
                  </Text>
                  <Text className="text-white/80 text-sm">Update family details and avatar</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowFamilyEditModal(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              {/* Family Name Input */}
              <View className="mb-6">
                <Text className="text-white font-semibold text-base mb-3">Family Name</Text>
                <TextInput
                  value={familyName}
                  onChangeText={setFamilyName}
                  placeholder="Enter family name"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white text-base"
                />
              </View>

              {/* Family Email Input */}
              <View className="mb-6">
                <Text className="text-white font-semibold text-base mb-3">Family Email</Text>
                <TextInput
                  value={familyEmail}
                  onChangeText={setFamilyEmail}
                  placeholder="Enter family email (optional)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white text-base"
                />
                <Text className="text-gray-500 text-xs mt-1">Optional: Add your family email</Text>
              </View>

              {/* Family Avatar Selection */}
              <View className="mb-6">
                <Text className="text-white font-semibold text-base mb-1">Family Avatar</Text>
                <Text className="text-gray-500 text-xs mb-4">
                  Tap an unlocked avatar to equip it as your family avatar.
                </Text>
                {avatarsLoading ? (
                  <View className="bg-gray-800/30 rounded-2xl p-4 items-center">
                    <Text className="text-gray-400">Loading avatars...</Text>
                  </View>
                ) : (
                  <View style={{ gap: 14 }}>
                    {/* Unlocked row */}
                    {avatarsData?.data?.avatars?.filter((a) => a.is_unlocked).length > 0 && (
                      <View>
                        <Text className="text-green-400 text-xs font-semibold mb-2 ml-1">Unlocked</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 10 }}
                        >
                          {avatarsData.data.avatars
                            .filter((a) => a.is_unlocked)
                            .map((avatar) => {
                              const isActive = avatar.is_selected;
                              return (
                                <TouchableOpacity
                                  key={`modal-unlocked-${avatar.id}`}
                                  onPress={() => !isActive && handleSelectFamilyAvatar(avatar.id)}
                                  disabled={selectAvatarMutation.isPending || isActive}
                                  activeOpacity={0.75}
                                >
                                  <View
                                    style={{
                                      width: 76,
                                      borderRadius: 18,
                                      overflow: "hidden",
                                      borderWidth: isActive ? 2 : 1,
                                      borderColor: isActive ? "#8B5CF6" : "rgba(75,85,99,0.5)",
                                      shadowColor: isActive ? "#8B5CF6" : "transparent",
                                      shadowOffset: { width: 0, height: 0 },
                                      shadowOpacity: isActive ? 0.7 : 0,
                                      shadowRadius: 10,
                                      elevation: isActive ? 6 : 0,
                                    }}
                                  >
                                    <LinearGradient
                                      colors={isActive ? ["#1E1035", "#2D1B5E"] : ["#1F2937", "#111827"]}
                                      style={{ padding: 8, alignItems: "center", gap: 6 }}
                                    >
                                      <View style={{ position: "relative", width: 48, height: 48 }}>
                                        <Image
                                          source={{ uri: `${STORAGE_BASE_URL}/${avatar.image}` }}
                                          style={{ width: 48, height: 48, borderRadius: 12 }}
                                          resizeMode="cover"
                                        />
                                        {isActive && (
                                          <View
                                            style={{
                                              position: "absolute",
                                              top: -4,
                                              right: -4,
                                              width: 18,
                                              height: 18,
                                              borderRadius: 9,
                                              backgroundColor: "#8B5CF6",
                                              borderWidth: 1.5,
                                              borderColor: "#1E1035",
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Ionicons name="checkmark" size={10} color="white" />
                                          </View>
                                        )}
                                        {selectAvatarMutation.isPending && !isActive && (
                                          <View
                                            style={{
                                              position: "absolute",
                                              inset: 0,
                                              width: 48,
                                              height: 48,
                                              borderRadius: 12,
                                              backgroundColor: "rgba(0,0,0,0.5)",
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <View
                                              style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: 9,
                                                borderWidth: 2,
                                                borderColor: "white",
                                                borderTopColor: "transparent",
                                              }}
                                            />
                                          </View>
                                        )}
                                      </View>
                                      <Text
                                        style={{
                                          color: isActive ? "#C4B5FD" : "#9CA3AF",
                                          fontSize: 9,
                                          fontWeight: "600",
                                          textAlign: "center",
                                        }}
                                        numberOfLines={1}
                                      >
                                        {avatar.name}
                                      </Text>
                                    </LinearGradient>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                        </ScrollView>
                      </View>
                    )}

                    {/* Locked row */}
                    {avatarsData?.data?.avatars?.filter((a) => !a.is_unlocked).length > 0 && (
                      <View>
                        <Text className="text-yellow-600 text-xs font-bold mb-2 ml-1">
                          🏆 Locked — Level Up to Claim
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 10 }}
                        >
                          {avatarsData.data.avatars
                            .filter((a) => !a.is_unlocked)
                            .map((avatar, index) => {
                              const isNext = index === 0;
                              return (
                                <View
                                  key={`modal-locked-${avatar.id}`}
                                  style={{
                                    width: 80,
                                    borderRadius: 18,
                                    overflow: "hidden",
                                    borderWidth: isNext ? 1.5 : 1,
                                    borderColor: isNext ? "rgba(245,158,11,0.55)" : "rgba(75,85,99,0.3)",
                                    shadowColor: isNext ? "#F59E0B" : "transparent",
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: isNext ? 0.3 : 0,
                                    shadowRadius: 8,
                                    elevation: isNext ? 5 : 0,
                                  }}
                                >
                                  <LinearGradient
                                    colors={isNext ? ["#1C1009", "#2D1A0A"] : ["#161B26", "#0F1520"]}
                                    style={{ padding: 8, alignItems: "center", gap: 6 }}
                                  >
                                    <View style={{ position: "relative", width: 52, height: 52 }}>
                                      <Image
                                        source={{ uri: `${STORAGE_BASE_URL}/${avatar.image}` }}
                                        style={{ width: 52, height: 52, borderRadius: 12 }}
                                        resizeMode="cover"
                                      />
                                      <View
                                        style={{
                                          position: "absolute",
                                          inset: 0,
                                          width: 52,
                                          height: 52,
                                          borderRadius: 12,
                                          backgroundColor: "rgba(0,0,0,0.28)",
                                        }}
                                      />
                                      {/* Level badge */}
                                      <LinearGradient
                                        colors={isNext ? ["#F59E0B", "#D97706"] : ["#374151", "#1F2937"]}
                                        style={{
                                          position: "absolute",
                                          top: -4,
                                          left: -4,
                                          borderRadius: 7,
                                          paddingHorizontal: 4,
                                          paddingVertical: 2,
                                        }}
                                      >
                                        <Text
                                          style={{
                                            color: isNext ? "#1C1009" : "#9CA3AF",
                                            fontSize: 7,
                                            fontWeight: "800",
                                          }}
                                        >
                                          LVL {avatar.required_level}
                                        </Text>
                                      </LinearGradient>
                                      {/* Lock dot */}
                                      <View
                                        style={{
                                          position: "absolute",
                                          bottom: -3,
                                          right: -3,
                                          width: 16,
                                          height: 16,
                                          borderRadius: 8,
                                          backgroundColor: isNext ? "#F59E0B" : "#374151",
                                          borderWidth: 1.5,
                                          borderColor: isNext ? "#1C1009" : "#111827",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Ionicons name="lock-closed" size={7} color={isNext ? "#1C1009" : "#6B7280"} />
                                      </View>
                                    </View>
                                    <Text
                                      style={{
                                        color: isNext ? "#FDE68A" : "#6B7280",
                                        fontSize: 9,
                                        fontWeight: "700",
                                        textAlign: "center",
                                      }}
                                      numberOfLines={1}
                                    >
                                      {avatar.name}
                                    </Text>
                                  </LinearGradient>
                                </View>
                              );
                            })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3 mb-4">
                <TouchableOpacity
                  onPress={() => setShowFamilyEditModal(false)}
                  className="flex-1 bg-gray-700/50 py-4 rounded-xl"
                >
                  <Text className="text-gray-300 text-center font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveFamily}
                  className="flex-1"
                  disabled={updateFamilyProfileMutation.isPending}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#EC4899"]}
                    className="py-4 rounded-xl"
                    style={{
                      shadowColor: "#8B5CF6",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      opacity: updateFamilyProfileMutation.isPending ? 0.6 : 1,
                    }}
                  >
                    <Text className="text-white text-center font-bold">
                      {updateFamilyProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View className="flex-1 bg-black/50 justify-center px-4">
            <View
              className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-700/50"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.5,
                shadowRadius: 25,
                elevation: 25,
              }}
            >
              {/* Modal Header */}
              <LinearGradient
                colors={["#10B981", "#059669", "#047857"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-6 py-5"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-xl">
                      Add Family Member
                    </Text>
                    <Text className="text-white/80 text-sm">Add a new member to your family</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowAddMemberModal(false)}
                    className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl items-center justify-center"
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              <View className="px-6 py-6">
                {/* Photo picker */}
                <View className="items-center mb-6">
                  <TouchableOpacity
                    onPress={() => pickImage(setNewMemberImage)}
                    activeOpacity={0.8}
                    style={{ position: "relative" }}
                  >
                    {newMemberImage ? (
                      <Image
                        source={{ uri: newMemberImage.uri }}
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 28,
                          borderWidth: 2,
                          borderColor: "rgba(16,185,129,0.5)",
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={["#052e16", "#14532d"]}
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 28,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1.5,
                          borderColor: "rgba(16,185,129,0.3)",
                        }}
                      >
                        <Text style={{ color: "#6EE7B7", fontSize: 32, fontWeight: "700" }}>
                          {newMemberName?.charAt(0).toUpperCase() || "+"}
                        </Text>
                      </LinearGradient>
                    )}
                    {/* Camera badge */}
                    <LinearGradient
                      colors={["#10B981", "#059669"]}
                      style={{
                        position: "absolute",
                        bottom: -4,
                        right: -4,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: "#111827",
                      }}
                    >
                      <Ionicons name="camera" size={14} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                  <Text className="text-gray-500 text-xs mt-3">Tap to add a photo (optional)</Text>
                </View>

                {/* Name Input */}
                <View className="mb-6">
                  <Text className="text-white font-semibold text-base mb-3">Member Name</Text>
                  <TextInput
                    value={newMemberName}
                    onChangeText={setNewMemberName}
                    placeholder="Enter member name"
                    placeholderTextColor="#9CA3AF"
                    className="bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white text-base"
                    autoFocus
                  />
                  <Text className="text-gray-500 text-xs mt-1">Choose a unique name for your family member</Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row" style={{ gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setShowAddMemberModal(false)}
                    className="flex-1 bg-gray-700/50 py-4 rounded-xl"
                  >
                    <Text className="text-gray-300 text-center font-semibold">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveNewMember}
                    className="flex-1"
                    disabled={addFamilyMemberMutation.isPending}
                  >
                    <LinearGradient
                      colors={["#10B981", "#059669"]}
                      className="py-4 rounded-xl"
                      style={{
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        opacity: addFamilyMemberMutation.isPending ? 0.6 : 1,
                      }}
                    >
                      <Text className="text-white text-center font-bold">
                        {addFamilyMemberMutation.isPending ? "Adding..." : "Add Member"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Logout Confirm Modal */}
      <Modal
        visible={showLogoutConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View
            className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-700/50"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.5,
              shadowRadius: 25,
              elevation: 25,
            }}
          >
            <LinearGradient
              colors={["#7F1D1D", "#991B1B", "#7F1D1D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-6 py-5"
            >
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                  <Ionicons name="log-out-outline" size={20} color="white" />
                </View>
                <View>
                  <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-xl">
                    Logout
                  </Text>
                  <Text className="text-white/70 text-sm">Are you sure?</Text>
                </View>
              </View>
            </LinearGradient>

            <View className="px-6 py-5">
              <Text className="text-gray-300 text-base mb-6 text-center">
                You'll need to sign back in to access your family profile.
              </Text>
              <View className="flex-row" style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-gray-700/50 py-4 rounded-xl"
                >
                  <Text className="text-gray-300 text-center font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmLogout} className="flex-1">
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    className="py-4 rounded-xl"
                    style={{
                      shadowColor: "#EF4444",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    }}
                  >
                    <Text className="text-white text-center font-bold">Logout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Levels Modal */}
      <Modal
        visible={showLevelsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLevelsModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center px-4">
          <View
            className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-700/50 max-h-[85%]"
            style={{
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.4,
              shadowRadius: 25,
              elevation: 25,
            }}
          >
            {/* Header */}
            <LinearGradient
              colors={["#8B5CF6", "#A855F7", "#C084FC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-6 py-5"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-xl mb-1">
                    Level Progression
                  </Text>
                  <Text className="text-white/80 text-sm">XP required to reach each level</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowLevelsModal(false)}
                  className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView
              className="px-6 py-4"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* Current level summary card */}
              <View
                className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 mb-5"
                style={{
                  shadowColor: "#8B5CF6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-purple-500/30 rounded-xl items-center justify-center mr-3">
                      <Ionicons name="star" size={20} color="#8B5CF6" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-base">Level {currentLevel}</Text>
                      <Text className="text-purple-300 text-xs">Current level</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-purple-400 font-bold text-base">{familyXP.toLocaleString()} XP</Text>
                    <Text className="text-gray-400 text-xs">{(maxXP - familyXP).toLocaleString()} to next</Text>
                  </View>
                </View>

                {/* Mini progress bar */}
                <View className="bg-gray-700/50 h-2 rounded-full overflow-hidden mt-3">
                  <LinearGradient
                    colors={["#8B5CF6", "#A855F7", "#C084FC"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(xpProgress, 100)}%` }}
                  />
                </View>
              </View>

              {/* Levels list */}
              {levelsLoading ? (
                <View className="items-center py-8">
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    {[0, 1, 2].map((i) => (
                      <View key={i} className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                    ))}
                  </View>
                  <Text className="text-gray-400 text-sm mt-3">Loading levels…</Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {(levelsData?.data || []).map((lvl, index) => {
                    const isCurrentLevel = lvl.level === currentLevel;
                    const isCompleted = lvl.level < currentLevel;
                    const isNext = lvl.level === currentLevel + 1;
                    const nextLvl = (levelsData?.data || [])[index + 1];
                    const xpForThis = lvl.xp_required;
                    const xpForNext = nextLvl?.xp_required ?? null;

                    return (
                      <View
                        key={lvl.level}
                        style={{
                          borderRadius: 18,
                          borderWidth: isCurrentLevel ? 1.5 : 1,
                          borderColor: isCurrentLevel
                            ? "rgba(139,92,246,0.5)"
                            : isCompleted
                            ? "rgba(16,185,129,0.25)"
                            : isNext
                            ? "rgba(245,158,11,0.3)"
                            : "rgba(255,255,255,0.06)",
                          backgroundColor: isCurrentLevel
                            ? "rgba(139,92,246,0.1)"
                            : isCompleted
                            ? "rgba(16,185,129,0.05)"
                            : "rgba(255,255,255,0.02)",
                          overflow: "hidden",
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 14 }}>
                          {/* Level badge */}
                          <LinearGradient
                            colors={
                              isCompleted
                                ? ["#065F46", "#059669"]
                                : isCurrentLevel
                                ? ["#5B21B6", "#7C3AED"]
                                : isNext
                                ? ["#92400E", "#B45309"]
                                : ["#1F2937", "#111827"]
                            }
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 14,
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {isCompleted ? (
                              <Ionicons name="checkmark" size={20} color="#fff" />
                            ) : (
                              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{lvl.level}</Text>
                            )}
                          </LinearGradient>

                          {/* Info */}
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                              <Text
                                style={{
                                  color: isCurrentLevel ? "#C4B5FD" : isCompleted ? "#34D399" : "#fff",
                                  fontWeight: "700",
                                  fontSize: 15,
                                }}
                              >
                                Level {lvl.level}
                              </Text>
                              {isCurrentLevel && (
                                <View
                                  style={{
                                    backgroundColor: "rgba(139,92,246,0.25)",
                                    borderRadius: 20,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderWidth: 1,
                                    borderColor: "rgba(139,92,246,0.4)",
                                  }}
                                >
                                  <Text style={{ color: "#C4B5FD", fontSize: 10, fontWeight: "700" }}>YOU</Text>
                                </View>
                              )}
                              {isNext && (
                                <View
                                  style={{
                                    backgroundColor: "rgba(245,158,11,0.15)",
                                    borderRadius: 20,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                  }}
                                >
                                  <Text style={{ color: "#FCD34D", fontSize: 10, fontWeight: "700" }}>NEXT</Text>
                                </View>
                              )}
                            </View>
                            <Text style={{ color: "#6B7280", fontSize: 12 }}>
                              {xpForThis.toLocaleString()} XP
                              {xpForNext !== null && ` — ${(xpForNext - 1).toLocaleString()} XP`}
                            </Text>
                          </View>

                          {/* XP pill */}
                          <View
                            style={{
                              backgroundColor: isCompleted
                                ? "rgba(16,185,129,0.1)"
                                : isCurrentLevel
                                ? "rgba(139,92,246,0.15)"
                                : "rgba(255,255,255,0.04)",
                              borderRadius: 12,
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: isCompleted ? "#34D399" : isCurrentLevel ? "#A78BFA" : "#4B5563",
                                fontWeight: "800",
                                fontSize: 13,
                              }}
                            >
                              {xpForThis >= 1000 ? `${(xpForThis / 1000).toFixed(1)}k` : xpForThis}
                            </Text>
                            <Text style={{ color: "#4B5563", fontSize: 9, marginTop: 1 }}>XP</Text>
                          </View>
                        </View>

                        {/* Progress bar for current level */}
                        {isCurrentLevel && (
                          <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
                            <View
                              style={{
                                height: 4,
                                backgroundColor: "rgba(255,255,255,0.06)",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <LinearGradient
                                colors={["#8B5CF6", "#C084FC"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ height: "100%", borderRadius: 2, width: `${Math.min(xpProgress, 100)}%` }}
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
