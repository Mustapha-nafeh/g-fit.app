import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAddFamilyMember, useGetFamilyMembers } from "../../api/profile";
import Modal from "react-native-modal";
import { showToast } from "../../constants";

export default function WelcomeUserSelection() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  // Get members from API
  const { data: membersData, isLoading, isError, refetch } = useGetFamilyMembers();

  // Add member mutation
  const { mutate, isLoading: addingMember, isError: addMemberError } = useAddFamilyMember();

  // Initialize with default members (fallback)
  const [members, setMembers] = useState([
    { id: 1, first_name: "user 1", color: "#6B7280", textColor: "#FFFFFF" },
    { id: 2, first_name: "user 2", color: "#E5E7EB", textColor: "#000000" },
    { id: 3, first_name: "user 3", color: "#EC4899", textColor: "#FFFFFF" },
    { id: 4, first_name: "user 4", color: "#3B82F6", textColor: "#FFFFFF" },
  ]);

  const handleUserSelect = async (userId) => {
    setSelectedUser(userId);

    try {
      // Store the selected user in Expo SecureStore
      const selectedUserData = members.find((user) => user.id === userId);
      await SecureStore.setItemAsync("member", JSON.stringify(selectedUserData));
      // Navigate to next screen
      router.replace("/(gfit)/home");
    } catch (error) {
      console.error("Error saving user to storage:", error);
    }
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      mutate(
        { first_name: newMemberName },
        {
          onSuccess: () => {
            setNewMemberName("");
            setModalVisible(false);
            showToast("success", "Member Added", "New member has been added successfully");
            refetch(); // Refresh the member list
          },
          onError: (error) => {
            console.error("Error adding member:", error);
            showToast("error", "Error", error.response.data.message || "Failed to add member. Please try again.");
            // Optionally show an error message to the user
          },
        }
      );
    }
  };

  useEffect(() => {
    if (!isLoading) {
      console.log("Members API Data:", membersData?.data);
    }

    // Check if we have valid API data
    if (membersData?.data && Array.isArray(membersData.data) && membersData.data.length > 0) {
      setMembers(membersData.data);
    }
    // If API data is empty or invalid, keep the default members
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
          <View className="mt-16 mb-12">
            <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-white text-5xl font-bold">
              Welcome!
            </Text>
          </View>

          {/* User Grid */}
          <View className="flex-1 justify-center">
            {members && Array.isArray(members) && members.length > 0 ? (
              <View className="px-4">
                {Array.from({ length: Math.ceil(members.length / 2) + (members.length < 5 ? 1 : 0) }).map(
                  (_, rowIndex) => (
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
                              {members[rowIndex * 2].first_name || "User"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : members.length < 5 &&
                        rowIndex === Math.ceil(members.length / 2) &&
                        members.length % 2 === 0 ? (
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
                              {members[rowIndex * 2 + 1].first_name || "User"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : members.length < 5 &&
                        rowIndex === Math.floor(members.length / 2) &&
                        members.length % 2 === 1 ? (
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
                  )
                )}
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-white text-lg mb-4">No members found</Text>
                <TouchableOpacity onPress={() => refetch()} className="bg-blue-500 px-6 py-3 rounded-lg">
                  <Text className="text-white font-medium">Reload</Text>
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
