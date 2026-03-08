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
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGlobalContext } from "../../context/GlobalContext";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useGetProfile, useGetFamilyMembers, useUpdateFamilyInfo, useUpdateMemberProfile } from "../../api/profile";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";

// Avatar system - simplified
const defaultAvatars = ["👤", "👨", "👩", "🧑", "👦", "👧", "🧒", "👶", "👴", "👵", "🧓", "👱", "👨‍🦰", "👩‍🦰", "👨‍🦱", "👩‍🦱"];

export default function ProfilePage() {
  const { member } = useGlobalContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFamilyEditModal, setShowFamilyEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [familyImage, setFamilyImage] = useState("");
  const [familyAvatar, setFamilyAvatar] = useState("");

  // API hooks
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile();
  const { data: familyMembersData, isLoading: membersLoading, refetch: refetchMembers } = useGetFamilyMembers();
  const updateFamilyInfoMutation = useUpdateFamilyInfo();
  const updateMemberProfileMutation = useUpdateMemberProfile();

  // XP system data (static for now - can be made dynamic later)
  const familyXP = 2850;
  const maxXP = 4200;
  const currentLevel = 7;
  const xpProgress = (familyXP / maxXP) * 100;

  useEffect(() => {
    if (profileData?.data) {
      setFamilyName(profileData.data.family_name || "My Family");
      setFamilyImage(profileData.data.family_image || "");
      setFamilyAvatar(profileData.data.family_avatar || "👨‍👩‍👧‍👦");
    }
  }, [profileData]);

  const handleEditMember = (memberData) => {
    setEditingMember(memberData);
    setEditName(memberData.username || "");
    setEditAvatar(memberData.image || "👤");
    setShowEditModal(true);
  };

  const handleSaveMember = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Please enter a name");
      return;
    }

    if (!editAvatar) {
      Alert.alert("Error", "Please select an avatar");
      return;
    }

    if (!editingMember?.token_key) {
      Alert.alert("Error", "Member token not found. Please try again.");
      return;
    }

    try {
      const updateData = {
        id: editingMember.id,
        token_key: editingMember.token_key,
        username: editName.trim(),
        image: editAvatar,
      };

      console.log("Updating member with data:", updateData);

      await updateMemberProfileMutation.mutateAsync(updateData);

      setShowEditModal(false);
      setEditingMember(null);
      setEditName("");
      setEditAvatar("");
      Alert.alert("Success", "Member updated successfully!");
      refetchMembers(); // Refresh the data
    } catch (error) {
      console.error("Error updating member:", error);
      Alert.alert("Error", "Failed to update member. Please try again.");
    }
  };

  const handleEditFamily = () => {
    setShowFamilyEditModal(true);
  };

  const handleSaveFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert("Error", "Please enter a family name");
      return;
    }

    try {
      await updateFamilyInfoMutation.mutateAsync({
        family_name: familyName.trim(),
        family_image: familyImage,
        family_avatar: familyAvatar,
      });

      setShowFamilyEditModal(false);
      Alert.alert("Success", "Family updated successfully!");
      refetchProfile(); // Refresh the data
    } catch (error) {
      console.error("Error updating family:", error);
      Alert.alert("Error", "Failed to update family. Please try again.");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await SecureStore.deleteItemAsync("token_key");
            await SecureStore.deleteItemAsync("member");
            await SecureStore.deleteItemAsync("selectedApp");
            router.replace("/(selection)/select-app");
          } catch (error) {
            console.error("Error during logout:", error);
            router.replace("/(selection)/select-app");
          }
        },
      },
    ]);
  };

  // XP Progress Component
  const XPProgressBar = () => (
    <View className="mb-6">
      <TouchableOpacity className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30">
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
              width: `${xpProgress}%`,
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
            <Text className="text-gray-300 text-sm">{(maxXP - familyXP).toLocaleString()} XP to next level</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-purple-400 text-sm font-medium">+120 XP today</Text>
            <Ionicons name="trending-up" size={14} color="#10B981" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-purple-500/30 rounded-2xl items-center justify-center mr-4">
                    <Text className="text-2xl">{familyAvatar}</Text>
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
            </View>
          </View>

          {/* Family Members Section */}
          <View className="px-6 mb-8">
            <Text className="text-white text-xl font-bold mb-4">Family Members</Text>

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
                        <View className="w-14 h-14 bg-gray-700/50 rounded-2xl items-center justify-center mr-4">
                          <Text className="text-2xl">{memberData.image || "👤"}</Text>
                        </View>
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
                    <Text className="text-gray-500 text-center text-xs">
                      Family members will appear here once they join your family
                    </Text>
                  </View>
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
        <View className="flex-1 bg-black/50 justify-center px-4">
          <View
            className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-700/50 max-h-[70%]"
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
                  <Text className="text-white/80 text-sm">Update your name and avatar</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
              {/* Name Input */}
              <View className="mb-6">
                <Text className="text-white font-semibold text-base mb-3">Name</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white text-base"
                />
              </View>

              {/* Avatar Selection */}
              <View className="mb-6">
                <Text className="text-white font-semibold text-base mb-3">Choose Avatar</Text>
                <View className="bg-gray-800/30 rounded-2xl p-4">
                  <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                    {defaultAvatars.map((avatar, index) => (
                      <TouchableOpacity
                        key={`edit-${index}`}
                        onPress={() => setEditAvatar(avatar)}
                        className={`w-14 h-14 rounded-xl items-center justify-center border-2 ${
                          editAvatar === avatar ? "bg-cyan-500/20 border-cyan-500" : "bg-gray-700/50 border-gray-600/30"
                        }`}
                      >
                        <Text className="text-2xl">{avatar}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3 mb-4">
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
            </ScrollView>
          </View>
        </View>
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
                    Edit Family
                  </Text>
                  <Text className="text-white/80 text-sm">Update family name, image and avatar</Text>
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

              {/* Family Image Input */}
              <View className="mb-6">
                <Text className="text-white font-semibold text-base mb-3">Family Image URL</Text>
                <TextInput
                  value={familyImage}
                  onChangeText={setFamilyImage}
                  placeholder="Enter image URL (optional)"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white text-base"
                />
              </View>

              {/* Family Avatar Selection */}
              <View className="mb-6">
                <Text className="text-white font-semibold text-base mb-3">Family Avatar</Text>
                <View className="bg-gray-800/30 rounded-2xl p-4">
                  <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                    {["👨‍👩‍👧‍👦", "👨‍👩‍👦‍👦", "👨‍👩‍👧‍👧", "👩‍👩‍👧‍👦", "👨‍👨‍👧‍👦", "🏠", "🏡", "🏘️", "👪", "❤️", "💕", "🌟"].map((avatar, index) => (
                      <TouchableOpacity
                        key={`family-${index}`}
                        onPress={() => setFamilyAvatar(avatar)}
                        className={`w-14 h-14 rounded-xl items-center justify-center border-2 ${
                          familyAvatar === avatar
                            ? "bg-purple-500/20 border-purple-500"
                            : "bg-gray-700/50 border-gray-600/30"
                        }`}
                      >
                        <Text className="text-2xl">{avatar}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
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
                  disabled={updateFamilyInfoMutation.isPending}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#EC4899"]}
                    className="py-4 rounded-xl"
                    style={{
                      shadowColor: "#8B5CF6",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      opacity: updateFamilyInfoMutation.isPending ? 0.6 : 1,
                    }}
                  >
                    <Text className="text-white text-center font-bold">
                      {updateFamilyInfoMutation.isPending ? "Saving..." : "Save Changes"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
