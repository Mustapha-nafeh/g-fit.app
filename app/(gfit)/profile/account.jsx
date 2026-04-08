import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "../../../context/GlobalContext";
import { showToast } from "../../../constants";
import { useGetProfile, useCancelSubscription } from "../../../api/profile";
import { useForgotPassword } from "../../../api/authApi";

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
  success: "#10B981",
};

// ─── Shared primitives ─────────────────────────────────────────────────────────

const SectionLabel = ({ title }) => (
  <Text
    style={{
      fontFamily: "MontserratAlternates_700Bold",
      fontSize: 13,
      color: C.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 10,
      marginTop: 28,
    }}
  >
    {title}
  </Text>
);

const InfoRow = ({ icon, label, value, iconColor }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    }}
  >
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
      }}
    >
      <Ionicons name={icon} size={17} color={iconColor || C.textSecondary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text
        style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 12, color: C.textSecondary, marginBottom: 2 }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 15, color: C.textPrimary }}>
        {value || "—"}
      </Text>
    </View>
  </View>
);

const ActionRow = ({ icon, label, sublabel, onPress, iconColor, chevron = true, last = false }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: C.border,
    }}
  >
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
      }}
    >
      <Ionicons name={icon} size={17} color={iconColor || C.textSecondary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 15, color: C.textPrimary }}>
        {label}
      </Text>
      {sublabel && (
        <Text
          style={{
            fontFamily: "MontserratAlternates_400Regular",
            fontSize: 12,
            color: C.textSecondary,
            marginTop: 1,
          }}
        >
          {sublabel}
        </Text>
      )}
    </View>
    {chevron && <Ionicons name="chevron-forward" size={16} color="#4B5563" />}
  </TouchableOpacity>
);

const Card = ({ children, style }) => (
  <View
    style={[
      {
        backgroundColor: C.surfaceLight,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.border,
        overflow: "hidden",
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { setMember } = useGlobalContext();
  const queryClient = useQueryClient();
  const { data: profileData, isLoading } = useGetProfile();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const cancelSubscriptionMutation = useCancelSubscription();
  const forgotPasswordMutation = useForgotPassword();

  const profile = profileData?.data;
  const isSubscribed = profile?.is_subscribed;
  const plan = profile?.subscription_plan || "Free Plan";
  const expiresAt = profile?.subscription_expires_at;
  const email = profile?.email;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleCancelSubscription = async () => {
    try {
      // 1. Tell backend to mark the subscription as cancelled
      await cancelSubscriptionMutation.mutateAsync();
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      showToast("success", "Subscription Cancelled", "Your plan stays active until the billing period ends.");
    } catch (e) {
      showToast("error", "Error", e.response?.data?.message || "Failed to cancel subscription. Please try again.");
      return;
    }
    // 2. On iOS, send user to Apple's subscription management page
    //    so Apple also stops the auto-renewal billing
    if (Platform.OS === "ios") {
      Linking.openURL("https://apps.apple.com/account/subscriptions");
    }
  };

  const handleChangePassword = async () => {
    if (!email) {
      showToast("error", "Error", "No email address on file.");
      return;
    }
    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setResetSent(true);
      showToast("success", "Email Sent", `Password reset link sent to ${email}`);
    } catch {
      showToast("error", "Error", "Failed to send reset email. Please try again.");
    }
  };

  const handleLogout = async () => {
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

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
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
              marginRight: 14,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={C.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 20, color: C.textPrimary }}>
              Account & Billing
            </Text>
            <Text
              style={{
                fontFamily: "MontserratAlternates_400Regular",
                fontSize: 13,
                color: C.textSecondary,
                marginTop: 1,
              }}
            >
              Manage your subscription and account
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
        >
          {isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <ActivityIndicator color={C.primary} />
              <Text
                style={{
                  fontFamily: "MontserratAlternates_400Regular",
                  fontSize: 14,
                  color: C.textSecondary,
                  marginTop: 12,
                }}
              >
                Loading…
              </Text>
            </View>
          ) : (
            <>
              {/* ── Subscription Section ── */}
              <SectionLabel title="Subscription" />

              {/* Plan card */}
              <Card>
                <View style={{ padding: 18 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: "rgba(214,235,235,0.1)",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="card-outline" size={20} color={C.primary} />
                      </View>
                      <View>
                        <Text
                          style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 17, color: C.textPrimary }}
                        >
                          {plan}
                        </Text>
                        {expiresAt && (
                          <Text
                            style={{
                              fontFamily: "MontserratAlternates_400Regular",
                              fontSize: 12,
                              color: isSubscribed ? C.textSecondary : C.danger,
                              marginTop: 2,
                            }}
                          >
                            {isSubscribed ? `Renews ${expiresAt}` : `Active until ${expiresAt}`}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Status badge */}
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 20,
                        backgroundColor: isSubscribed ? "rgba(16,185,129,0.12)" : "rgba(107,114,128,0.15)",
                        borderWidth: 1,
                        borderColor: isSubscribed ? "rgba(16,185,129,0.3)" : "rgba(107,114,128,0.2)",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "MontserratAlternates_700Bold",
                          fontSize: 11,
                          color: isSubscribed ? C.success : C.textSecondary,
                        }}
                      >
                        {isSubscribed ? "ACTIVE" : "INACTIVE"}
                      </Text>
                    </View>
                  </View>

                  {!isSubscribed && (
                    <View
                      style={{
                        backgroundColor: "rgba(214,235,235,0.06)",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "rgba(214,235,235,0.12)",
                        padding: 12,
                      }}
                    >
                      <Text
                        style={{ fontFamily: "MontserratAlternates_400Regular", fontSize: 13, color: C.textSecondary }}
                      >
                        Upgrade to unlock all features, unlimited members, and priority support.
                      </Text>
                    </View>
                  )}
                </View>

                {isSubscribed && (
                  <TouchableOpacity
                    onPress={() => setShowCancelModal(true)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      paddingVertical: 14,
                      borderTopWidth: 1,
                      borderTopColor: "rgba(239,68,68,0.12)",
                    }}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={C.danger} />
                    <Text style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 14, color: C.danger }}>
                      Cancel Subscription
                    </Text>
                  </TouchableOpacity>
                )}
              </Card>

              {/* ── Account Section ── */}
              <SectionLabel title="Account" />

              <Card>
                <InfoRow icon="mail-outline" label="Email Address" value={email} iconColor={C.primary} />
                <ActionRow
                  icon="lock-closed-outline"
                  label="Change Password"
                  sublabel={resetSent ? `Reset link sent to ${email}` : "Send a reset link to your email"}
                  onPress={handleChangePassword}
                  iconColor={C.purpleLight}
                  chevron={!resetSent}
                  last
                />
              </Card>

              {/* ── Danger Zone ── */}
              <SectionLabel title="Danger Zone" />

              <Card>
                <TouchableOpacity
                  onPress={() => setShowLogoutModal(true)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 15,
                    paddingHorizontal: 18,
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: "rgba(239,68,68,0.1)",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 14,
                    }}
                  >
                    <Ionicons name="log-out-outline" size={17} color={C.danger} />
                  </View>
                  <Text
                    style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 15, color: C.danger, flex: 1 }}
                  >
                    Log Out
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#4B5563" />
                </TouchableOpacity>
              </Card>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ── Cancel Subscription Modal ── */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
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
                <Ionicons name="close-circle-outline" size={20} color={C.danger} />
              </View>
              <View>
                <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 18, color: C.textPrimary }}>
                  Cancel Subscription
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
                Your subscription will remain active until the end of the current billing period.
                {Platform.OS === "ios" ? "\n\nYou'll also be taken to Apple Settings to stop auto-renewal." : ""}
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowCancelModal(false)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: C.secondary,
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 15, color: C.textSecondary }}
                  >
                    Keep Plan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancelSubscription}
                  disabled={cancelSubscriptionMutation.isPending}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    backgroundColor: C.danger,
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: "center",
                    opacity: cancelSubscriptionMutation.isPending ? 0.6 : 1,
                  }}
                >
                  {cancelSubscriptionMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 15, color: "#fff" }}>
                      Cancel Plan
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Log Out Modal ── */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
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
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowLogoutModal(false)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: C.secondary,
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ fontFamily: "MontserratAlternates_600SemiBold", fontSize: 15, color: C.textSecondary }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogout}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    backgroundColor: C.danger,
                    paddingVertical: 14,
                    borderRadius: 16,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontFamily: "MontserratAlternates_700Bold", fontSize: 15, color: "#fff" }}>
                    Log Out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
