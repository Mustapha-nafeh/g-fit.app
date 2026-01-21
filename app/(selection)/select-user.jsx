import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAddFamilyMember, useGetFamilyMembers } from "../../api/profile";
import Modal from "react-native-modal";
import { showToast } from "../../constants";

export default function WelcomeUserSelection() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const { selectedApp } = useLocalSearchParams();

  // Get members from API
  const { data: membersData, isLoading, isError, refetch } = useGetFamilyMembers();

  // Add member mutation
  const { mutate, isLoading: addingMember, isError: addMemberError } = useAddFamilyMember();

  // Start with empty members array
  const [members, setMembers] = useState([]);

  const handleUserSelect = async (userId) => {
    setSelectedUser(userId);

    try {
      // Store the selected user's token_key in Expo SecureStore
      const selectedUserData = members.find((user) => user.id === userId);
      if (selectedUserData && selectedUserData.token_key) {
        // Store the member's token_key for future API calls
        await SecureStore.setItemAsync("token_key", selectedUserData.token_key);
        // Also store the member data for profile info
        await SecureStore.setItemAsync("member", JSON.stringify(selectedUserData));
        // Store the selected app for future reference
        if (selectedApp) {
          await SecureStore.setItemAsync("selectedApp", selectedApp);
        }

        // Navigate based on selected app
        let route = "/(gfit)/home"; // Default fallback

        switch (selectedApp) {
          case "gfit":
            route = "/(gfit)/home";
            break;
          case "gtkf":
            route = "/(gtkf)/workouts";
            break;
          case "adults":
            route = "/(adults)/home"; // Assuming this exists
            break;
          default:
            route = "/(gfit)/home"; // Default fallback
            break;
        }

        router.replace(route);
      } else {
        showToast("error", "Error", "Failed to select user. Please try again.");
      }
    } catch (error) {
      showToast("error", "Error", "Failed to save user data. Please try again.");
    }
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      mutate(
        { username: newMemberName },
        {
          onSuccess: () => {
            setNewMemberName("");
            setModalVisible(false);
            showToast("success", "Member Added", "New member has been added successfully");
            refetch(); // Refresh the member list
          },
          onError: (error) => {
            showToast("error", "Error", error.response.data.message || "Failed to add member. Please try again.");
            // Optionally show an error message to the user
          },
        }
      );
    }
  };

  useEffect(() => {
    // Update members when API data is available
    if (membersData?.data && Array.isArray(membersData.data)) {
      setMembers(membersData.data);
    } else {
      // If no data or invalid data, keep empty array
      setMembers([]);
    }
  }, [membersData, isLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-white text-lg">Loading members...</Text>
      </View>
    );
  }

  // Show error state
  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-white text-lg mb-4">Error loading members</Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-blue-500 px-6 py-3 rounded-lg">
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8">
          {/* Title */}
          <View className="mt-16 mb-8">
            <Text
              style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
              className="text-white text-5xl font-bold mb-4"
            >
              Welcome!
            </Text>
            <Text
              className="text-gray-400 text-base text-center"
              style={{ fontFamily: "MontserratAlternates_400Regular" }}
            >
              Select a family member to continue
            </Text>
          </View>

          {/* User Grid */}
          <View className="flex-1 justify-center">
            {members && Array.isArray(members) && members.length > 0 ? (
              <View className="px-4">
                {/* Calculate how many rows we need (members + 1 add button) */}
                {Array.from({ length: Math.ceil((members.length + 1) / 2) }).map((_, rowIndex) => (
                  <View key={rowIndex} className="flex-row justify-between mb-6 gap-x-2">
                    {/* First column */}
                    {members[rowIndex * 2] ? (
                      <TouchableOpacity
                        key={members[rowIndex * 2].id}
                        onPress={() => handleUserSelect(members[rowIndex * 2].id)}
                        className="rounded-3xl items-center justify-center"
                        style={{
                          backgroundColor: members[rowIndex * 2].color || "#6B7280",
                          width: "47%",
                          height: 160,
                        }}
                      >
                        <View className="items-center">
                          <View
                            className="w-16 h-16 rounded-full border-2 items-center justify-center mb-4"
                            style={{
                              borderColor: members[rowIndex * 2].textColor || "#FFFFFF",
                            }}
                          >
                            <Ionicons
                              name="person-outline"
                              size={32}
                              color={members[rowIndex * 2].textColor || "#FFFFFF"}
                            />
                          </View>
                          <Text
                            className="text-md font-medium text-center"
                            style={{
                              color: members[rowIndex * 2].textColor || "#FFFFFF",
                              fontFamily: "MontserratAlternates_600SemiBold",
                            }}
                          >
                            {members[rowIndex * 2].username || "User"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      // Show "Add Member" button in first column if no member
                      <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="rounded-3xl items-center justify-center border-2 border-white/30"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          width: "47%",
                          height: 160,
                        }}
                      >
                        <View className="items-center">
                          <View
                            className="w-16 h-16 rounded-full border-2 items-center justify-center mb-4"
                            style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
                          >
                            <Ionicons name="add" size={32} color="rgba(255, 255, 255, 0.8)" />
                          </View>
                          <Text
                            className="text-md font-medium text-center"
                            style={{
                              color: "rgba(255, 255, 255, 0.8)",
                              fontFamily: "MontserratAlternates_600SemiBold",
                            }}
                          >
                            Add Member
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Second column */}
                    {members[rowIndex * 2 + 1] ? (
                      <TouchableOpacity
                        key={members[rowIndex * 2 + 1].id}
                        onPress={() => handleUserSelect(members[rowIndex * 2 + 1].id)}
                        className="rounded-3xl items-center justify-center"
                        style={{
                          backgroundColor: members[rowIndex * 2 + 1].color || "#6B7280",
                          width: "47%",
                          height: 160,
                        }}
                      >
                        <View className="items-center">
                          <View
                            className="w-16 h-16 rounded-full border-2 items-center justify-center mb-4"
                            style={{
                              borderColor: members[rowIndex * 2 + 1].textColor || "#FFFFFF",
                            }}
                          >
                            <Ionicons
                              name="person-outline"
                              size={32}
                              color={members[rowIndex * 2 + 1].textColor || "#FFFFFF"}
                            />
                          </View>
                          <Text
                            className="text-md font-medium text-center"
                            style={{
                              color: members[rowIndex * 2 + 1].textColor || "#FFFFFF",
                              fontFamily: "MontserratAlternates_600SemiBold",
                            }}
                          >
                            {members[rowIndex * 2 + 1].username || "User"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : rowIndex * 2 + 1 === members.length ? (
                      // Show "Add Member" button in second column if this is the spot after the last member
                      <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="rounded-3xl items-center justify-center border-2 border-white/30"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          width: "47%",
                          height: 160,
                        }}
                      >
                        <View className="items-center">
                          <View
                            className="w-16 h-16 rounded-full border-2 items-center justify-center mb-4"
                            style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
                          >
                            <Ionicons name="add" size={32} color="rgba(255, 255, 255, 0.8)" />
                          </View>
                          <Text
                            className="text-md font-medium text-center"
                            style={{
                              color: "rgba(255, 255, 255, 0.8)",
                              fontFamily: "MontserratAlternates_600SemiBold",
                            }}
                          >
                            Add Member
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ width: "47%" }} />
                    )}
                  </View>
                ))}
              </View>
            ) : (
              // Show "Add First Member" when no members exist
              <View className="items-center px-8">
                <Text
                  className="text-white text-2xl mb-6 text-center"
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                >
                  No family members yet
                </Text>
                <Text
                  className="text-gray-400 text-base mb-8 text-center leading-6"
                  style={{ fontFamily: "MontserratAlternates_400Regular" }}
                >
                  Add your first family member to get started with personalized fitness tracking
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  className="rounded-3xl items-center justify-center border-2 border-white/30"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    width: 200,
                    height: 160,
                  }}
                >
                  <View className="items-center">
                    <View
                      className="w-16 h-16 rounded-full border-2 items-center justify-center mb-4"
                      style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
                    >
                      <Ionicons name="add" size={32} color="rgba(255, 255, 255, 0.8)" />
                    </View>
                    <Text
                      className="text-md font-medium text-center"
                      style={{
                        color: "rgba(255, 255, 255, 0.8)",
                        fontFamily: "MontserratAlternates_600SemiBold",
                      }}
                    >
                      Add First Member
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Add Member Modal */}
        <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
          <View className="bg-buttonPrimary rounded-lg p-6 m-4">
            <Text
              className="text-xl text-buttonSecondary font-bold mb-4"
              style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
            >
              Add New Member
            </Text>
            <TextInput
              className="border border-buttonSecondary rounded-lg p-2 mb-4"
              placeholder="Enter member's name"
              value={newMemberName}
              onChangeText={setNewMemberName}
              style={{ fontFamily: "MontserratAlternates_400Regular" }}
            />
            {addMemberError && (
              <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-gtkfText mb-4 ">
                Error adding member.
              </Text>
            )}
            <View className="flex-row justify-end gap-x-4">
              <TouchableOpacity
                onPress={() => {
                  setNewMemberName("");
                  setModalVisible(false);
                }}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                <Text className="text-black font-medium" style={{ fontFamily: "MontserratAlternates_600SemiBold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddMember}
                className={`px-4 py-2 rounded-lg ${
                  newMemberName.trim() && !addingMember ? "bg-buttonSecondary" : "bg-gray-300"
                }`}
                disabled={!newMemberName.trim() || addingMember}
              >
                <Text className="text-white font-medium" style={{ fontFamily: "MontserratAlternates_600SemiBold" }}>
                  {addingMember ? "Adding..." : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
