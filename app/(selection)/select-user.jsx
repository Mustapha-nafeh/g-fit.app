import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAddFamilyMember, useGetFamilyMembers } from "../../api/profile";
import { useRegisterPushNotifications } from "../../hooks/useNotifications";
import Modal from "react-native-modal";
import { showToast } from "../../constants";

// ─── Member card ───────────────────────────────────────────────────────────────

const MemberCard = ({ member, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(member.id)}
    activeOpacity={0.8}
    style={{
      width: "47%",
      height: 156,
      borderRadius: 24,
      backgroundColor: member.color || "#494358",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 14,
    }}
  >
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: member.textColor || "rgba(255,255,255,0.5)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <Ionicons name="person-outline" size={28} color={member.textColor || "#FFFFFF"} />
    </View>
    <Text
      numberOfLines={1}
      style={{
        fontFamily: "MontserratAlternates_600SemiBold",
        fontSize: 15,
        color: member.textColor || "#FFFFFF",
        paddingHorizontal: 12,
        textAlign: "center",
      }}
    >
      {member.username || "User"}
    </Text>
  </TouchableOpacity>
);

// ─── Add member card ───────────────────────────────────────────────────────────

const AddMemberCard = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      width: "47%",
      height: 156,
      borderRadius: 24,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.15)",
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 14,
    }}
  >
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: "rgba(214,235,235,0.4)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <Ionicons name="add" size={28} color="#D6EBEB" />
    </View>
    <Text
      style={{
        fontFamily: "MontserratAlternates_600SemiBold",
        fontSize: 14,
        color: "#D6EBEB",
      }}
    >
      Add Member
    </Text>
  </TouchableOpacity>
);

// ─── Member grid ───────────────────────────────────────────────────────────────

const MemberGrid = ({ members, onSelectUser, onAddMember }) => {
  // Flatten members + one "add" slot, then chunk into rows of 2
  const items = [...members, { type: "add" }];
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <View>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {row.map((item, colIdx) =>
            item.type === "add" ? (
              <AddMemberCard key="add" onPress={onAddMember} />
            ) : (
              <MemberCard key={item.id} member={item} onPress={onSelectUser} />
            )
          )}
          {/* Spacer if row has only one item and it's not the add button */}
          {row.length === 1 && row[0].type !== "add" && <View style={{ width: "47%" }} />}
        </View>
      ))}
    </View>
  );
};

// ─── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = ({ onAdd }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(214,235,235,0.08)",
        borderWidth: 1,
        borderColor: "rgba(214,235,235,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <Ionicons name="people-outline" size={36} color="#D6EBEB" />
    </View>
    <Text
      style={{
        fontFamily: "MontserratAlternates_700Bold",
        fontSize: 22,
        color: "#FFFFFF",
        marginBottom: 12,
        textAlign: "center",
      }}
    >
      No family members yet
    </Text>
    <Text
      style={{
        fontFamily: "MontserratAlternates_400Regular",
        fontSize: 15,
        color: "#A0A0A0",
        lineHeight: 23,
        textAlign: "center",
        marginBottom: 36,
        maxWidth: 260,
      }}
    >
      Add your first family member to start competing together.
    </Text>
    <TouchableOpacity
      onPress={onAdd}
      activeOpacity={0.85}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#D6EBEB",
        paddingHorizontal: 28,
        paddingVertical: 15,
        borderRadius: 28,
        gap: 8,
      }}
    >
      <Ionicons name="add" size={20} color="#262135" />
      <Text
        style={{
          fontFamily: "MontserratAlternates_700Bold",
          fontSize: 16,
          color: "#262135",
        }}
      >
        Add First Member
      </Text>
    </TouchableOpacity>
  </View>
);

// ─── Add member modal ──────────────────────────────────────────────────────────

const AddMemberModal = ({ visible, name, onChangeName, onSubmit, onCancel, isLoading, hasError }) => (
  <Modal isVisible={visible} onBackdropPress={onCancel} avoidKeyboard>
    <View
      style={{
        backgroundColor: "#3A2D6E",
        borderRadius: 24,
        padding: 28,
        marginHorizontal: 4,
      }}
    >
      <Text
        style={{
          fontFamily: "MontserratAlternates_700Bold",
          fontSize: 20,
          color: "#FFFFFF",
          marginBottom: 20,
        }}
      >
        Add New Member
      </Text>

      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="Enter member's name"
        placeholderTextColor="#6B7280"
        style={{
          fontFamily: "MontserratAlternates_400Regular",
          fontSize: 15,
          color: "#FFFFFF",
          backgroundColor: "rgba(255,255,255,0.07)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: hasError ? 10 : 24,
        }}
      />

      {hasError && (
        <Text
          style={{
            fontFamily: "MontserratAlternates_400Regular",
            fontSize: 13,
            color: "#F87171",
            marginBottom: 16,
          }}
        >
          Failed to add member. Please try again.
        </Text>
      )}

      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.7}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.08)",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "MontserratAlternates_600SemiBold",
              fontSize: 15,
              color: "#A0A0A0",
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={!name.trim() || isLoading}
          activeOpacity={0.85}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: name.trim() && !isLoading ? "#D6EBEB" : "#494358",
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#262135" />
          ) : (
            <Text
              style={{
                fontFamily: "MontserratAlternates_700Bold",
                fontSize: 15,
                color: name.trim() ? "#262135" : "#6B7280",
              }}
            >
              Add
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function WelcomeUserSelection() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [members, setMembers] = useState([]);
  const { selectedApp } = useLocalSearchParams();

  const { registerAndStoreToken } = useRegisterPushNotifications();
  const { data: membersData, isLoading, isError, refetch } = useGetFamilyMembers();
  const { mutate, isLoading: addingMember, isError: addMemberError } = useAddFamilyMember();

  useEffect(() => {
    if (membersData?.data && Array.isArray(membersData.data)) {
      setMembers(membersData.data);
    } else {
      setMembers([]);
    }
  }, [membersData, isLoading]);

  const handleUserSelect = async (userId) => {
    try {
      const selectedUserData = members.find((user) => user.id === userId);
      if (selectedUserData?.token_key) {
        await SecureStore.setItemAsync("token_key", selectedUserData.token_key);
        await SecureStore.setItemAsync("member", JSON.stringify(selectedUserData));
        if (selectedApp) {
          await SecureStore.setItemAsync("selectedApp", selectedApp);
        }
        await registerAndStoreToken(selectedUserData.token_key);

        const routes = { gfit: "/(gfit)/home", gtkf: "/(gtkf)/workouts", adults: "/(adults)/home" };
        router.replace(routes[selectedApp] ?? "/(gfit)/home");
      } else {
        showToast("error", "Error", "Failed to select user. Please try again.");
      }
    } catch {
      showToast("error", "Error", "Failed to save user data. Please try again.");
    }
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    mutate(
      { username: newMemberName },
      {
        onSuccess: () => {
          setNewMemberName("");
          setModalVisible(false);
          showToast("success", "Member Added", "New member has been added successfully");
          refetch();
        },
        onError: (error) => {
          showToast("error", "Error", error.response?.data?.message || "Failed to add member. Please try again.");
        },
      }
    );
  };

  const handleCloseModal = () => {
    setNewMemberName("");
    setModalVisible(false);
  };

  // ── Loading state ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#262135", justifyContent: "center", alignItems: "center" }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#D6EBEB" />
        <Text
          style={{
            fontFamily: "MontserratAlternates_400Regular",
            fontSize: 15,
            color: "#A0A0A0",
            marginTop: 16,
          }}
        >
          Loading members…
        </Text>
      </View>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: "#262135", justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="cloud-offline-outline" size={48} color="#A0A0A0" style={{ marginBottom: 20 }} />
        <Text
          style={{
            fontFamily: "MontserratAlternates_600SemiBold",
            fontSize: 20,
            color: "#FFFFFF",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          Something went wrong
        </Text>
        <Text
          style={{
            fontFamily: "MontserratAlternates_400Regular",
            fontSize: 15,
            color: "#A0A0A0",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          We couldn't load your family members.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#D6EBEB",
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 28,
          }}
        >
          <Text
            style={{
              fontFamily: "MontserratAlternates_700Bold",
              fontSize: 16,
              color: "#262135",
            }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: "#262135" }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ paddingTop: 48, marginBottom: 36 }}>
            <Text
              style={{
                fontFamily: "MontserratAlternates_400Regular",
                fontSize: 14,
                color: "#A0A0A0",
                marginBottom: 10,
                letterSpacing: 0.3,
              }}
            >
              Step 2 of 2
            </Text>
            <Text
              style={{
                fontFamily: "MontserratAlternates_700Bold",
                fontSize: 32,
                color: "#FFFFFF",
                lineHeight: 42,
                marginBottom: 8,
              }}
            >
              Who's playing{"\n"}today?
            </Text>
            <Text
              style={{
                fontFamily: "MontserratAlternates_400Regular",
                fontSize: 15,
                color: "#A0A0A0",
              }}
            >
              Tap your name to jump in.
            </Text>
          </View>

          {/* Grid or empty state */}
          {members.length > 0 ? (
            <MemberGrid
              members={members}
              onSelectUser={handleUserSelect}
              onAddMember={() => setModalVisible(true)}
            />
          ) : (
            <EmptyState onAdd={() => setModalVisible(true)} />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Add Member Modal */}
      <AddMemberModal
        visible={isModalVisible}
        name={newMemberName}
        onChangeName={setNewMemberName}
        onSubmit={handleAddMember}
        onCancel={handleCloseModal}
        isLoading={addingMember}
        hasError={addMemberError}
      />
    </View>
  );
}
