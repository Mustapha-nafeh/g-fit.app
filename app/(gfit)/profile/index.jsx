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
import { useGlobalContext } from "../../../context/GlobalContext";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { showToast } from "../../../constants";
import {
  useGetProfile,
  useGetFamilyMembers,
  useUpdateFamilyProfile,
  useUpdateMemberProfile,
  useAddFamilyMember,
  useGetUnlockedAvatars,
  useSelectAvatar,
  useGetLevels,
} from "../../../api/profile";
import { STORAGE_BASE_URL } from "../../../config";
import { parseXP, xpProgressLabel, xpRemainingLabel } from "../../../utils/xp";

// ─── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg: "#262135",
  surface: "#2D2645",
  surfaceLight: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  borderAccent: "rgba(214,235,235,0.3)",
  primary: "#D6EBEB",
  primaryText: "#262135",
  secondary: "#494358",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0A0",
  yellow: "#F6F3BA",
  purple: "#8B5CF6",
  purpleLight: "#C4B5FD",
  danger: "#EF4444",
};

// ─── Shared primitives ─────────────────────────────────────────────────────────

const SectionHeader = ({ title, right }) => (
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 18, color: C.textPrimary }}>{title}</Text>
    {right}
  </View>
);

const ModalShell = ({ visible, onClose, title, subtitle, children, scrollable = false }) => {
  const content = (
    <View
      style={{
        backgroundColor: C.surface,
        borderRadius: 28,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: C.border,
        maxHeight: "90%",
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          borderBottomWidth: 1,
          borderBottomColor: C.border,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 18, color: C.textPrimary }}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontFamily: "MontserratAlternates_400Regular",
                fontSize: 13,
                color: C.textSecondary,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: C.secondary,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 12,
          }}
        >
          <Ionicons name="close" size={18} color={C.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      {scrollable ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
          {children}
        </ScrollView>
      ) : (
        <View style={{ padding: 24 }}>{children}</View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", paddingHorizontal: 16 }}>
        {content}
      </View>
    </Modal>
  );
};

const FormInput = ({ label, hint, ...props }) => (
  <View style={{ marginBottom: 20 }}>
    {label && (
      <Text
        style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 14, color: C.textPrimary, marginBottom: 8 }}
      >
        {label}
      </Text>
    )}
    <TextInput
      placeholderTextColor={C.textSecondary}
      style={{
        fontFamily: "MontserratAlternates_400Regular",
        fontSize: 15,
        color: C.textPrimary,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 13,
      }}
      {...props}
    />
    {hint && (
      <Text
        style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 12, color: C.textSecondary, marginTop: 5 }}
      >
        {hint}
      </Text>
    )}
  </View>
);

const ModalActions = ({ onCancel, onConfirm, confirmLabel, isPending, destructive = false }) => (
  <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
    <TouchableOpacity
      onPress={onCancel}
      activeOpacity={0.7}
      style={{
        flex: 1,
        backgroundColor: C.secondary,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
      }}
    >
      <Text style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 15, color: C.textSecondary }}>
        Cancel
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={onConfirm}
      disabled={isPending}
      activeOpacity={0.85}
      style={{
        flex: 1,
        backgroundColor: destructive ? C.danger : C.primary,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? (
        <ActivityIndicator size="small" color={destructive ? "#fff" : C.primaryText} />
      ) : (
        <Text
          style={{
            fontFamily: "MontserratAlternates_700Bold",
            fontSize: 15,
            color: destructive ? "#fff" : C.primaryText,
          }}
        >
          {confirmLabel}
        </Text>
      )}
    </TouchableOpacity>
  </View>
);

// ─── Avatar chip (unlocked) ────────────────────────────────────────────────────

const UnlockedAvatarChip = ({ avatar, onSelect, isPending, size = 80 }) => {
  const isActive = avatar.is_selected;
  return (
    <TouchableOpacity
      onPress={() => !isActive && onSelect(avatar.id)}
      disabled={isPending || isActive}
      activeOpacity={0.75}
    >
      <View
        style={{
          width: size,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? C.primary : C.border,
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 6,
          backgroundColor: isActive ? "rgba(214,235,235,0.08)" : C.surfaceLight,
          gap: 8,
        }}
      >
        <View style={{ position: "relative", width: size - 28, height: size - 28 }}>
          <Image
            source={{ uri: `${STORAGE_BASE_URL}/${avatar.image}` }}
            style={{ width: size - 28, height: size - 28, borderRadius: 12 }}
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
                backgroundColor: C.primary,
                borderWidth: 1.5,
                borderColor: C.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark" size={10} color={C.primaryText} />
            </View>
          )}
          {isPending && !isActive && (
            <View
              style={{
                position: "absolute",
                inset: 0,
                width: size - 28,
                height: size - 28,
                borderRadius: 12,
                backgroundColor: "rgba(0,0,0,0.5)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          )}
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: "MontserratAlternates_600SemiBold",
            color: isActive ? C.primary : C.textSecondary,
            fontSize: 10,
            textAlign: "center",
          }}
        >
          {avatar.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Locked avatar chip ────────────────────────────────────────────────────────

const LockedAvatarChip = ({ avatar, isNext }) => (
  <View
    style={{
      width: 90,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: isNext ? 1.5 : 1,
      borderColor: isNext ? "rgba(246,243,186,0.5)" : C.border,
      backgroundColor: isNext ? "rgba(246,243,186,0.06)" : C.surfaceLight,
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 6,
      gap: 8,
    }}
  >
    <View style={{ position: "relative", width: 60, height: 60 }}>
      <Image
        source={{ uri: `${STORAGE_BASE_URL}/${avatar.image}` }}
        style={{ width: 60, height: 60, borderRadius: 14 }}
        resizeMode="cover"
      />
      <View
        style={{
          position: "absolute",
          inset: 0,
          width: 60,
          height: 60,
          borderRadius: 14,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      />
      {/* Level badge */}
      <View
        style={{
          position: "absolute",
          top: -5,
          left: -5,
          backgroundColor: isNext ? C.yellow : C.secondary,
          borderRadius: 7,
          paddingHorizontal: 5,
          paddingVertical: 2,
        }}
      >
        <Text
          style={{
            fontFamily: "MontserratAlternates_700Bold",
            color: isNext ? C.primaryText : C.textSecondary,
            fontSize: 8,
          }}
        >
          LVL {avatar.required_level}
        </Text>
      </View>
      {/* Lock dot */}
      <View
        style={{
          position: "absolute",
          bottom: -4,
          right: -4,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: isNext ? C.yellow : C.secondary,
          borderWidth: 1.5,
          borderColor: C.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="lock-closed" size={9} color={isNext ? C.primaryText : C.textSecondary} />
      </View>
    </View>
    <Text
      numberOfLines={1}
      style={{
        fontFamily: "MontserratAlternates_600SemiBold",
        color: isNext ? C.yellow : "#4B5563",
        fontSize: 10,
        textAlign: "center",
      }}
    >
      {avatar.name}
    </Text>
  </View>
);

// ─── Photo picker ──────────────────────────────────────────────────────────────

const PhotoPicker = ({ image, initial, onPress }) => (
  <View style={{ alignItems: "center", marginBottom: 24 }}>
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ position: "relative" }}>
      {image ? (
        <Image
          source={{ uri: image.uri ?? image }}
          style={{ width: 88, height: 88, borderRadius: 28, borderWidth: 2, borderColor: C.borderAccent }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 28,
            backgroundColor: C.secondary,
            borderWidth: 1.5,
            borderColor: C.border,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: C.primary, fontSize: 30, fontFamily: "MontserratAlternates_700Bold" }}>
            {initial?.charAt(0).toUpperCase() || "+"}
          </Text>
        </View>
      )}
      <View
        style={{
          position: "absolute",
          bottom: -4,
          right: -4,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: C.primary,
          borderWidth: 2,
          borderColor: C.surface,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="camera" size={13} color={C.primaryText} />
      </View>
    </TouchableOpacity>
    <Text
      style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 12, color: C.textSecondary, marginTop: 10 }}
    >
      Tap to change photo
    </Text>
  </View>
);

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { member, setMember } = useGlobalContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFamilyEditModal, setShowFamilyEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberImage, setNewMemberImage] = useState(null);
  const [familyName, setFamilyName] = useState("");
  const [familyEmail, setFamilyEmail] = useState("");
  const [familyPhone, setFamilyPhone] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // API hooks
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile();
  const { data: familyMembersData, isLoading: membersLoading, refetch: refetchMembers } = useGetFamilyMembers();
  const { data: avatarsData, isLoading: avatarsLoading, refetch: refetchAvatars } = useGetUnlockedAvatars();
  const { data: levelsData, isLoading: levelsLoading } = useGetLevels();
  const updateFamilyProfileMutation = useUpdateFamilyProfile();
  const updateMemberProfileMutation = useUpdateMemberProfile();
  const addFamilyMemberMutation = useAddFamilyMember();
  const selectAvatarMutation = useSelectAvatar();

  // XP calculations — single source of truth via parseXP()
  const xpData = parseXP(profileData?.data, levelsData?.data);
  const {
    xp: familyXP,
    level: currentLevel,
    completionXP,
    bandMax,
    xpToNextLevel,
    remainingXP,
    progressPct: xpProgress,
    isMaxLevel,
  } = xpData;

  const activeAvatar = avatarsData?.data?.avatars?.find((a) => a.is_selected);
  const unlockedAvatars = avatarsData?.data?.avatars?.filter((a) => a.is_unlocked) ?? [];
  const lockedAvatars = avatarsData?.data?.avatars?.filter((a) => !a.is_unlocked) ?? [];
  const nextLockedAvatar = [...lockedAvatars].sort((a, b) => a.required_level - b.required_level)[0];

  useEffect(() => {
    if (profileData?.data) {
      setFamilyName(profileData.data.name || "My Family");
      setFamilyEmail(profileData.data.email || "");
      setFamilyPhone(profileData.data.phone || "");
    }
  }, [profileData]);

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  const handleEditMember = (memberData) => {
    setEditingMember(memberData);
    setEditName(memberData.username || "");
    setEditImage(memberData.image ? { uri: `${STORAGE_BASE_URL}/${memberData.image}` } : null);
    setShowEditModal(true);
  };

  const handleSaveMember = async () => {
    if (!editName.trim()) {
      showToast("error", "Error", "Please enter a name");
      return;
    }
    if (!editingMember?.token_key) {
      showToast("error", "Error", "Member token not found.");
      return;
    }
    try {
      await updateMemberProfileMutation.mutateAsync({
        token_key: editingMember.token_key,
        username: editName.trim(),
        image: editImage?.uri?.startsWith("file://") ? editImage : undefined,
      });
      setShowEditModal(false);
      setEditingMember(null);
      setEditName("");
      setEditImage(null);
      showToast("success", "Success", "Member updated successfully!");
      refetchMembers();
    } catch {
      showToast("error", "Error", "Failed to update member. Please try again.");
    }
  };

  const handleSaveFamily = async () => {
    if (!familyName.trim()) {
      showToast("error", "Error", "Please enter a family name");
      return;
    }
    try {
      await updateFamilyProfileMutation.mutateAsync({
        name: familyName.trim(),
        email: familyEmail.trim(),
        phone: familyPhone.trim(),
      });
      setShowFamilyEditModal(false);
      showToast("success", "Success", "Family profile updated!");
      refetchProfile();
    } catch {
      showToast("error", "Error", "Failed to update family profile. Please try again.");
    }
  };

  const handleSaveNewMember = async () => {
    if (!newMemberName.trim()) {
      showToast("error", "Error", "Please enter a name");
      return;
    }
    const existing = familyMembersData?.data?.map((m) => m.username.toLowerCase()) || [];
    if (existing.includes(newMemberName.trim().toLowerCase())) {
      showToast("error", "Error", "A member with this name already exists");
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
      showToast("success", "Success", `${newMemberName.trim()} added to your family!`);
      refetchMembers();
    } catch {
      showToast("error", "Error", "Failed to add family member. Please try again.");
    }
  };

  const handleSelectFamilyAvatar = async (avatarId) => {
    try {
      await selectAvatarMutation.mutateAsync({ avatar_id: avatarId });
      const selected = avatarsData?.data?.avatars?.find((a) => a.id === avatarId);
      refetchProfile();
      refetchAvatars();
      showToast("success", "Success", `${selected?.name || "Avatar"} equipped!`);
    } catch {
      showToast("error", "Error", "Failed to select avatar. Please try again.");
    }
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
    } catch {}
    setMember(null);
    router.replace("/(auth)/login");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={C.primary}
              colors={[C.primary]}
            />
          }
        >
          {/* ── Header ── */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 22, color: C.textPrimary }}>
                Family Profile
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(gfit)/profile/account")}
              activeOpacity={0.7}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: C.surfaceLight,
                borderWidth: 1,
                borderColor: C.border,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="settings-outline" size={18} color={C.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 24, paddingVertical: 30 }}>
            {/* ── XP Progress Card ── */}
            <TouchableOpacity
              onPress={() => setShowLevelsModal(true)}
              activeOpacity={0.85}
              style={{
                backgroundColor: C.surfaceLight,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: C.border,
                padding: 18,
                marginBottom: 16,
              }}
            >
              {profileLoading ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8 }}
                >
                  <ActivityIndicator size="small" color={C.primary} />
                  <Text
                    style={{ fontFamily: "MontserratAlternates_400Regular", color: C.textSecondary, marginLeft: 10 }}
                  >
                    Loading…
                  </Text>
                </View>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          backgroundColor: "rgba(139,92,246,0.2)",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="star" size={14} color={C.purple} />
                      </View>
                      <Text
                        style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 15, color: C.textPrimary }}
                      >
                        Family XP
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 13, color: C.purpleLight }}>
                        Level {currentLevel}
                      </Text>
                      <Text
                        style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 12, color: C.textSecondary }}
                      >
                        · {xpProgressLabel(xpData)}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "rgba(255,255,255,0.07)",
                      overflow: "hidden",
                      marginBottom: 10,
                    }}
                  >
                    <LinearGradient
                      colors={["#8B5CF6", "#A855F7", "#C084FC"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ width: `${Math.min(xpProgress, 100)}%`, height: "100%", borderRadius: 4 }}
                    />
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Ionicons name="trophy" size={13} color={C.yellow} />
                      <Text
                        style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 12, color: C.textSecondary }}
                      >
                        {xpRemainingLabel(xpData)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Text
                        style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 12, color: C.purpleLight }}
                      >
                        {xpProgressLabel(xpData)}
                      </Text>
                      <Ionicons name="trending-up" size={13} color="#10B981" />
                    </View>
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* ── Family Info Card ── */}
            <View
              style={{
                backgroundColor: C.surfaceLight,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: C.border,
                padding: 18,
                marginBottom: 60,
              }}
            >
              {profileLoading ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8 }}
                >
                  <ActivityIndicator size="small" color={C.primary} />
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* Family avatar */}
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: "#ffffff",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 16,
                      overflow: "hidden",
                    }}
                  >
                    {activeAvatar?.image ? (
                      <Image
                        source={{ uri: `${STORAGE_BASE_URL}/${activeAvatar.image}` }}
                        style={{ width: 44, height: 44 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={{ fontSize: 24 }}>👨‍👩‍👧‍👦</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 18, color: C.textPrimary }}>
                      {familyName}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "MontserratAlternates_400Regular",
                        fontSize: 13,
                        color: C.purpleLight,
                        marginTop: 2,
                      }}
                    >
                      Level {currentLevel} Family
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowFamilyEditModal(true)}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 12,
                      backgroundColor: C.secondary,
                    }}
                  >
                    <Text
                      style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 13, color: C.textPrimary }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ── Family Members ── */}
            <View style={{ marginBottom: 60 }}>
              <SectionHeader
                title="Family Members"
                right={
                  <TouchableOpacity
                    onPress={() => {
                      setNewMemberName("");
                      setNewMemberImage(null);
                      setShowAddMemberModal(true);
                    }}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 12,
                      backgroundColor: C.secondary,
                    }}
                  >
                    <Ionicons name="person-add" size={14} color={C.primary} />
                    <Text style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 13, color: C.primary }}>
                      Add
                    </Text>
                  </TouchableOpacity>
                }
              />

              {membersLoading ? (
                <View style={{ backgroundColor: C.surfaceLight, borderRadius: 16, padding: 24, alignItems: "center" }}>
                  <ActivityIndicator color={C.primary} />
                </View>
              ) : familyMembersData?.data?.length > 0 ? (
                <View style={{ gap: 10 }}>
                  {familyMembersData.data.map((memberData) => {
                    const isCurrentUser = memberData.id === member?.id;
                    return (
                      <View
                        key={memberData.id}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: C.surfaceLight,
                          borderRadius: 18,
                          borderWidth: 1,
                          borderColor: isCurrentUser ? C.borderAccent : C.border,
                          padding: 14,
                        }}
                      >
                        {/* Avatar */}
                        {memberData.image ? (
                          <Image
                            source={{ uri: `${STORAGE_BASE_URL}/${memberData.image}` }}
                            style={{ width: 48, height: 48, borderRadius: 14, marginRight: 14 }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 14,
                              backgroundColor: memberData.color || C.secondary,
                              justifyContent: "center",
                              alignItems: "center",
                              marginRight: 14,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_700Bold",
                                color: memberData.textColor || C.textPrimary,
                                fontSize: 18,
                              }}
                            >
                              {memberData.username?.charAt(0).toUpperCase() || "?"}
                            </Text>
                          </View>
                        )}

                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_600SemiBold",
                                fontSize: 16,
                                color: C.textPrimary,
                              }}
                            >
                              {memberData.username}
                            </Text>
                            {isCurrentUser && (
                              <View
                                style={{
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                  borderRadius: 10,
                                  backgroundColor: "rgba(214,235,235,0.15)",
                                  borderWidth: 1,
                                  borderColor: C.borderAccent,
                                }}
                              >
                                <Text
                                  style={{
                                    fontFamily: "MontserratAlternates_600SemiBold",
                                    fontSize: 10,
                                    color: C.primary,
                                  }}
                                >
                                  YOU
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={{
                              fontFamily: "MontserratAlternates_400Regular",
                              fontSize: 12,
                              color: C.textSecondary,
                              marginTop: 2,
                            }}
                          >
                            Family Member
                          </Text>
                        </View>

                        {isCurrentUser && (
                          <TouchableOpacity
                            onPress={() => handleEditMember(memberData)}
                            activeOpacity={0.7}
                            style={{
                              paddingHorizontal: 14,
                              paddingVertical: 8,
                              borderRadius: 12,
                              backgroundColor: C.secondary,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_600SemiBold",
                                fontSize: 13,
                                color: C.textPrimary,
                              }}
                            >
                              Edit
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: C.surfaceLight,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: C.border,
                    padding: 28,
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="people-outline" size={32} color={C.textSecondary} style={{ marginBottom: 10 }} />
                  <Text
                    style={{
                      fontFamily: "MontserratAlternates_600SemiBold",
                      fontSize: 15,
                      color: C.textPrimary,
                      marginBottom: 5,
                    }}
                  >
                    No family members yet
                  </Text>
                  <Text
                    style={{
                      fontFamily: "MontserratAlternates_400Regular",
                      fontSize: 13,
                      color: C.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    Add your first member to get started
                  </Text>
                </View>
              )}
            </View>

            {/* ── Avatar Collection ── */}
            <View style={{ marginBottom: 40 }}>
              <SectionHeader
                title="Avatar Collection"
                right={
                  !avatarsLoading && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 12,
                        backgroundColor: C.secondary,
                      }}
                    >
                      <Ionicons name="shield-checkmark" size={12} color={C.purpleLight} />
                      <Text
                        style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 12, color: C.purpleLight }}
                      >
                        {unlockedAvatars.length} / {avatarsData?.data?.avatars?.length || 0}
                      </Text>
                    </View>
                  )
                }
              />

              {avatarsLoading ? (
                <View style={{ backgroundColor: C.surfaceLight, borderRadius: 18, padding: 32, alignItems: "center" }}>
                  <ActivityIndicator color={C.primary} />
                  <Text
                    style={{
                      fontFamily: "MontserratAlternates_400Regular",
                      fontSize: 14,
                      color: C.textSecondary,
                      marginTop: 12,
                    }}
                  >
                    Loading avatars…
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 16 }}>
                  {/* Active avatar hero */}
                  {activeAvatar && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "rgba(214,235,235,0.06)",
                        borderRadius: 20,
                        borderWidth: 1.5,
                        borderColor: "rgba(214,235,235,0.15)",
                        padding: 16,
                        gap: 16,
                      }}
                    >
                      <View style={{ position: "relative" }}>
                        <View
                          style={{
                            width: 68,
                            height: 68,
                            borderRadius: 34,
                            backgroundColor: C.secondary,
                            padding: 3,
                          }}
                        >
                          <Image
                            source={{ uri: `${STORAGE_BASE_URL}/${activeAvatar.image}` }}
                            style={{ width: "100%", height: "100%", borderRadius: 32 }}
                            resizeMode="cover"
                          />
                        </View>
                        <View
                          style={{
                            position: "absolute",
                            bottom: -2,
                            right: -2,
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            backgroundColor: C.primary,
                            borderWidth: 2,
                            borderColor: C.bg,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="checkmark" size={11} color={C.bg} />
                        </View>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <Text
                            style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 16, color: C.textPrimary }}
                          >
                            {activeAvatar.name}
                          </Text>
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 10,
                              backgroundColor: "rgba(214,235,235,0.12)",
                            }}
                          >
                            <Text
                              style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 10, color: C.primary }}
                            >
                              Active
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{
                            fontFamily: "MontserratAlternates_400Regular",
                            fontSize: 13,
                            color: C.textSecondary,
                          }}
                        >
                          Your family's current avatar
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 }}>
                          <Ionicons name="star" size={11} color={C.yellow} />
                          <Text
                            style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 11, color: C.yellow }}
                          >
                            Unlocked at Level {activeAvatar.required_level || 1}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Unlocked avatars */}
                  {unlockedAvatars.length > 0 && (
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" }} />
                        <Text
                          style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 13, color: "#10B981" }}
                        >
                          Unlocked
                        </Text>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10, paddingRight: 4 }}
                      >
                        {unlockedAvatars.map((avatar) => (
                          <UnlockedAvatarChip
                            key={`unlocked-${avatar.id}`}
                            avatar={avatar}
                            onSelect={handleSelectFamilyAvatar}
                            isPending={selectAvatarMutation.isPending}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Locked avatars */}
                  {lockedAvatars.length > 0 && (
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: "rgba(246,243,186,0.06)",
                          borderRadius: 14,
                          padding: 12,
                          marginBottom: 10,
                          borderWidth: 1,
                          borderColor: "rgba(246,243,186,0.12)",
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Ionicons name="trophy" size={16} color={C.yellow} />
                          <View>
                            <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 13, color: C.yellow }}>
                              Exclusive Avatars
                            </Text>
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_400Regular",
                                fontSize: 11,
                                color: C.textSecondary,
                              }}
                            >
                              Level up to claim them
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 10,
                            backgroundColor: "rgba(246,243,186,0.12)",
                          }}
                        >
                          <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 11, color: C.yellow }}>
                            {lockedAvatars.length} locked
                          </Text>
                        </View>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10, paddingRight: 8 }}
                      >
                        {lockedAvatars.map((avatar, index) => (
                          <LockedAvatarChip key={`locked-${avatar.id}`} avatar={avatar} isNext={index === 0} />
                        ))}
                      </ScrollView>

                      {/* Next unlock teaser */}
                      {nextLockedAvatar && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: 12,
                            backgroundColor: "rgba(246,243,186,0.06)",
                            borderRadius: 18,
                            borderWidth: 1,
                            borderColor: "rgba(246,243,186,0.15)",
                            padding: 14,
                            gap: 12,
                          }}
                        >
                          <View style={{ position: "relative" }}>
                            <Image
                              source={{ uri: `${STORAGE_BASE_URL}/${nextLockedAvatar.image}` }}
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
                            <View
                              style={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: C.yellow,
                                borderWidth: 1.5,
                                borderColor: C.bg,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Ionicons name="flash" size={10} color={C.primaryText} />
                            </View>
                          </View>
                          <View style={{ flex: 1, gap: 3 }}>
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_400Regular",
                                fontSize: 10,
                                color: C.textSecondary,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Next Unlock
                            </Text>
                            <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 15, color: C.yellow }}>
                              {nextLockedAvatar.name}
                            </Text>
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_400Regular",
                                fontSize: 12,
                                color: C.textSecondary,
                              }}
                            >
                              {nextLockedAvatar.required_level - currentLevel <= 0
                                ? "You're so close!"
                                : nextLockedAvatar.required_level - currentLevel === 1
                                ? "Just 1 more level!"
                                : `${nextLockedAvatar.required_level - currentLevel} levels away`}
                            </Text>
                          </View>
                          <View
                            style={{
                              borderWidth: 1.5,
                              borderColor: "rgba(246,243,186,0.4)",
                              borderRadius: 14,
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_400Regular",
                                fontSize: 9,
                                color: C.textSecondary,
                                textTransform: "uppercase",
                              }}
                            >
                              Reach
                            </Text>
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_700Bold",
                                fontSize: 20,
                                color: C.yellow,
                                lineHeight: 24,
                              }}
                            >
                              {nextLockedAvatar.required_level}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* All unlocked */}
                  {lockedAvatars.length === 0 && (
                    <View
                      style={{
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: "rgba(16,185,129,0.25)",
                        backgroundColor: "rgba(16,185,129,0.06)",
                        padding: 20,
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Ionicons name="trophy" size={28} color="#10B981" />
                      <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 15, color: "#10B981" }}>
                        Collection Complete!
                      </Text>
                      <Text
                        style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 13, color: C.textSecondary }}
                      >
                        You've unlocked every avatar. Legendary.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ── Edit Member Modal ── */}
      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", paddingHorizontal: 16 }}
          >
            <View
              style={{
                backgroundColor: C.surface,
                borderRadius: 28,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: C.border,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 18, color: C.textPrimary }}>
                    Edit Profile
                  </Text>
                  <Text
                    style={{
                      fontFamily: "MontserratAlternates_400Regular",
                      fontSize: 13,
                      color: C.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Update your name and photo
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: C.secondary,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="close" size={18} color={C.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={{ padding: 24 }}>
                <PhotoPicker image={editImage} initial={editName} onPress={() => pickImage(setEditImage)} />
                <FormInput
                  label="Name"
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  autoFocus
                />
                <ModalActions
                  onCancel={() => setShowEditModal(false)}
                  onConfirm={handleSaveMember}
                  confirmLabel="Save Changes"
                  isPending={updateMemberProfileMutation.isPending}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Family Edit Modal ── */}
      <Modal
        visible={showFamilyEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFamilyEditModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", paddingHorizontal: 16 }}>
          <View
            style={{
              backgroundColor: C.surface,
              borderRadius: 28,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: C.border,
              maxHeight: "85%",
            }}
          >
            <View
              style={{
                paddingHorizontal: 24,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 18, color: C.textPrimary }}>
                  Edit Family Profile
                </Text>
                <Text
                  style={{
                    fontFamily: "MontserratAlternates_400Regular",
                    fontSize: 13,
                    color: C.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Update family details and avatar
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFamilyEditModal(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: C.secondary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="close" size={18} color={C.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
              <FormInput
                label="Family Name"
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="Enter family name"
              />
              {/* <FormInput
                label="Family Email"
                value={familyEmail}
                onChangeText={setFamilyEmail}
                placeholder="Email (optional)"
                keyboardType="email-address"
                autoCapitalize="none"
                hint="Optional: used for account recovery"
              /> */}

              {/* Avatar selection inside family modal */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontFamily: "MontserratAlternates_600SemiBold",
                    fontSize: 14,
                    color: C.textPrimary,
                    marginBottom: 5,
                  }}
                >
                  Family Avatar
                </Text>
                <Text
                  style={{
                    fontFamily: "MontserratAlternates_400Regular",
                    fontSize: 12,
                    color: C.textSecondary,
                    marginBottom: 12,
                  }}
                >
                  Tap an unlocked avatar to equip it.
                </Text>
                {avatarsLoading ? (
                  <ActivityIndicator color={C.primary} />
                ) : (
                  <View style={{ gap: 14 }}>
                    {unlockedAvatars.length > 0 && (
                      <View>
                        <Text
                          style={{
                            fontFamily: "MontserratAlternates_600SemiBold",
                            fontSize: 12,
                            color: "#10B981",
                            marginBottom: 8,
                          }}
                        >
                          Unlocked
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 10 }}
                        >
                          {unlockedAvatars.map((avatar) => (
                            <UnlockedAvatarChip
                              key={`modal-unlocked-${avatar.id}`}
                              avatar={avatar}
                              onSelect={handleSelectFamilyAvatar}
                              isPending={selectAvatarMutation.isPending}
                              size={72}
                            />
                          ))}
                        </ScrollView>
                      </View>
                    )}
                    {lockedAvatars.length > 0 && (
                      <View>
                        <Text
                          style={{
                            fontFamily: "MontserratAlternates_600SemiBold",
                            fontSize: 12,
                            color: C.yellow,
                            marginBottom: 8,
                          }}
                        >
                          Locked — Level Up to Claim
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 10 }}
                        >
                          {lockedAvatars.map((avatar, index) => (
                            <LockedAvatarChip key={`modal-locked-${avatar.id}`} avatar={avatar} isNext={index === 0} />
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <ModalActions
                onCancel={() => setShowFamilyEditModal(false)}
                onConfirm={handleSaveFamily}
                confirmLabel="Save Changes"
                isPending={updateFamilyProfileMutation.isPending}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Add Member Modal ── */}
      <Modal
        visible={showAddMemberModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", paddingHorizontal: 16 }}
          >
            <View
              style={{
                backgroundColor: C.surface,
                borderRadius: 28,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 20,
                  borderBottomWidth: 1,
                  borderBottomColor: C.border,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 18, color: C.textPrimary }}>
                    Add Family Member
                  </Text>
                  <Text
                    style={{
                      fontFamily: "MontserratAlternates_400Regular",
                      fontSize: 13,
                      color: C.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Add a new member to your family
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAddMemberModal(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: C.secondary,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="close" size={18} color={C.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={{ padding: 24 }}>
                <PhotoPicker
                  image={newMemberImage}
                  initial={newMemberName || "+"}
                  onPress={() => pickImage(setNewMemberImage)}
                />
                <FormInput
                  label="Member Name"
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                  placeholder="Enter member name"
                  autoFocus
                  hint="Choose a unique name for your family member"
                />
                <ModalActions
                  onCancel={() => setShowAddMemberModal(false)}
                  onConfirm={handleSaveNewMember}
                  confirmLabel="Add Member"
                  isPending={addFamilyMemberMutation.isPending}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Logout Confirm Modal ── */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", paddingHorizontal: 24 }}>
          <View
            style={{
              backgroundColor: C.surface,
              borderRadius: 28,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <View
              style={{
                paddingHorizontal: 24,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(239,68,68,0.15)",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(239,68,68,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(239,68,68,0.25)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="log-out-outline" size={20} color={C.danger} />
              </View>
              <View>
                <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 18, color: C.textPrimary }}>
                  Log Out
                </Text>
                <Text style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 13, color: C.textSecondary }}>
                  Are you sure?
                </Text>
              </View>
            </View>
            <View style={{ padding: 24 }}>
              <Text
                style={{
                  fontFamily: "MontserratAlternates_400Regular",
                  fontSize: 15,
                  color: C.textSecondary,
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                You'll need to sign back in to access your family profile.
              </Text>
              <ModalActions
                onCancel={() => setShowLogoutConfirm(false)}
                onConfirm={confirmLogout}
                confirmLabel="Log Out"
                destructive
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Levels Modal ── */}
      <Modal
        visible={showLevelsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLevelsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", paddingHorizontal: 16 }}>
          <View
            style={{
              backgroundColor: C.surface,
              borderRadius: 28,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: C.border,
              maxHeight: "85%",
            }}
          >
            <View
              style={{
                paddingHorizontal: 24,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 18, color: C.textPrimary }}>
                  Level Progression
                </Text>
                <Text
                  style={{
                    fontFamily: "MontserratAlternates_400Regular",
                    fontSize: 13,
                    color: C.textSecondary,
                    marginTop: 2,
                  }}
                >
                  XP required to reach each level
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowLevelsModal(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: C.secondary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="close" size={18} color={C.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 32 }}>
              {/* Current level summary */}
              <View
                style={{
                  backgroundColor: "rgba(139,92,246,0.1)",
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "rgba(139,92,246,0.25)",
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: "rgba(139,92,246,0.25)",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="star" size={18} color={C.purple} />
                    </View>
                    <View>
                      <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 15, color: C.textPrimary }}>
                        Level {currentLevel}
                      </Text>
                      <Text
                        style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 12, color: C.purpleLight }}
                      >
                        Current level
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 15, color: C.purpleLight }}>
                      {xpProgressLabel(xpData)}
                    </Text>
                    <Text
                      style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 12, color: C.textSecondary }}
                    >
                      {xpRemainingLabel(xpData)}
                    </Text>
                  </View>
                </View>
                <View
                  style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" }}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#A855F7", "#C084FC"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: `${Math.min(xpProgress, 100)}%`, height: "100%", borderRadius: 3 }}
                  />
                </View>
              </View>

              {/* Levels list */}
              {levelsLoading ? (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <ActivityIndicator color={C.primary} />
                  <Text
                    style={{
                      fontFamily: "MontserratAlternates_400Regular",
                      fontSize: 14,
                      color: C.textSecondary,
                      marginTop: 12,
                    }}
                  >
                    Loading levels…
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {(levelsData?.data || []).map((lvl, index) => {
                    const isCurrentLevel = lvl.level === currentLevel;
                    const isCompleted = lvl.level < currentLevel;
                    const isNext = lvl.level === currentLevel + 1;
                    const nextLvl = (levelsData?.data || [])[index + 1];
                    return (
                      <View
                        key={lvl.level}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 14,
                          borderRadius: 16,
                          borderWidth: isCurrentLevel ? 1.5 : 1,
                          borderColor: isCurrentLevel
                            ? "rgba(139,92,246,0.4)"
                            : isCompleted
                            ? "rgba(16,185,129,0.2)"
                            : isNext
                            ? "rgba(246,243,186,0.2)"
                            : C.border,
                          backgroundColor: isCurrentLevel
                            ? "rgba(139,92,246,0.08)"
                            : isCompleted
                            ? "rgba(16,185,129,0.04)"
                            : "rgba(255,255,255,0.02)",
                          gap: 14,
                        }}
                      >
                        {/* Level badge */}
                        <View
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 13,
                            backgroundColor: isCompleted
                              ? "rgba(16,185,129,0.25)"
                              : isCurrentLevel
                              ? "rgba(139,92,246,0.3)"
                              : isNext
                              ? "rgba(246,243,186,0.15)"
                              : C.secondary,
                            justifyContent: "center",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isCompleted ? (
                            <Ionicons name="checkmark" size={18} color="#10B981" />
                          ) : (
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_700Bold",
                                fontSize: 16,
                                color: isCurrentLevel ? C.purpleLight : isNext ? C.yellow : C.textSecondary,
                              }}
                            >
                              {lvl.level}
                            </Text>
                          )}
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 2 }}>
                            <Text
                              style={{
                                fontFamily: "MontserratAlternates_700Bold",
                                fontSize: 14,
                                color: isCurrentLevel ? C.purpleLight : isCompleted ? "#10B981" : C.textPrimary,
                              }}
                            >
                              Level {lvl.level}
                            </Text>
                            {isCurrentLevel && (
                              <View
                                style={{
                                  paddingHorizontal: 7,
                                  paddingVertical: 2,
                                  borderRadius: 8,
                                  backgroundColor: "rgba(139,92,246,0.2)",
                                }}
                              >
                                <Text
                                  style={{
                                    fontFamily: "MontserratAlternates_700Bold",
                                    fontSize: 9,
                                    color: C.purpleLight,
                                  }}
                                >
                                  YOU
                                </Text>
                              </View>
                            )}
                            {isNext && (
                              <View
                                style={{
                                  paddingHorizontal: 7,
                                  paddingVertical: 2,
                                  borderRadius: 8,
                                  backgroundColor: "rgba(246,243,186,0.12)",
                                }}
                              >
                                <Text
                                  style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 9, color: C.yellow }}
                                >
                                  NEXT
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            style={{
                              fontFamily: "MontserratAlternates_400Regular",
                              fontSize: 12,
                              color: C.textSecondary,
                            }}
                          >
                            {lvl.xp_required.toLocaleString()} XP
                            {nextLvl ? ` — ${(nextLvl.xp_required - 1).toLocaleString()} XP` : ""}
                          </Text>
                        </View>

                        <View
                          style={{
                            borderRadius: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            alignItems: "center",
                            backgroundColor: isCompleted
                              ? "rgba(16,185,129,0.1)"
                              : isCurrentLevel
                              ? "rgba(139,92,246,0.12)"
                              : "rgba(255,255,255,0.04)",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "MontserratAlternates_700Bold",
                              fontSize: 13,
                              color: isCompleted ? "#10B981" : isCurrentLevel ? C.purpleLight : "#4B5563",
                            }}
                          >
                            {lvl.xp_required >= 1000 ? `${(lvl.xp_required / 1000).toFixed(1)}k` : lvl.xp_required}
                          </Text>
                          <Text
                            style={{
                              fontFamily: "MontserratAlternates_400Regular",
                              fontSize: 9,
                              color: C.textSecondary,
                              marginTop: 1,
                            }}
                          >
                            XP
                          </Text>
                        </View>
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
