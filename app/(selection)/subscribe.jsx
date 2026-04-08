import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useIAP, PURCHASE_STATE } from "../../hooks/useIap";
import { useGlobalContext } from "../../context/GlobalContext";
import { showToast } from "../../constants";

const STATE_LABELS = {
  [PURCHASE_STATE.REQUESTING]: "Requesting…",
  [PURCHASE_STATE.PROCESSING]: "Processing…",
  [PURCHASE_STATE.VERIFYING]: "Verifying…",
  [PURCHASE_STATE.SUCCESS]: "Subscribed!",
  [PURCHASE_STATE.ERROR]: "Try Again",
};

const FEATURES = [
  { label: "All fitness challenges", icon: "trophy-outline" },
  { label: "Full workout library", icon: "barbell-outline" },
  { label: "Expert guidance & tips", icon: "bulb-outline" },
];

export default function SubscriptionPage() {
  const { isSubscribed, signOut } = useGlobalContext();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  const { purchaseState, errorMessage, productInfo, isProductLoading, subscribe, resetError, isLoading } = useIAP();

  useEffect(() => {
    if (purchaseState === PURCHASE_STATE.SUCCESS) {
      router.replace("/(selection)/success");
    }
    if (purchaseState === PURCHASE_STATE.ERROR && errorMessage) {
      showToast("error", "Payment Failed", errorMessage);
      resetError();
    }
  }, [purchaseState, errorMessage]);

  useEffect(() => {
    if (isSubscribed && purchaseState === PURCHASE_STATE.IDLE) {
      router.replace("/(selection)/select-app");
    }
  }, [isSubscribed]);

  const handleBack = () => {
    if (!isLoading) router.back();
  };

  const price = productInfo?.displayPrice ?? productInfo?.localizedPrice ?? "--";
  const periodRaw =
    productInfo?.subscriptionPeriodUnitIOS?.toLowerCase() ??
    productInfo?.subscriptionOffers?.[0]?.period?.unit ??
    "month";
  const period = periodRaw.charAt(0).toUpperCase() + periodRaw.slice(1);
  // const planTitle = productInfo?.title?.replace(/\s*\(.*?\)\s*$/g, "") ?? "Premium";
  const planTitle = "Monthly";
  const buttonLabel = STATE_LABELS[purchaseState] ?? `Subscribe for ${price} / ${period}`;

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      <Image source={require("../../assets/Ellipse1.png")} className="absolute top-0 left-0" />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-2 pb-1">
          <TouchableOpacity
            onPress={handleBack}
            disabled={isLoading}
            className="w-10 h-10 rounded-2xl border border-gray-600 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color={isLoading ? "#555" : "white"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} disabled={isLoading}>
            <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-textLight text-xs">
              Use a different account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          {/* Hero */}
          <View className="mt-8 mb-8">
            <Text
              style={{ fontFamily: "MontserratAlternates_700Bold" }}
              className="text-white text-3xl leading-tight mb-3"
            >
              Unlock your{"\n"}
              <Text className="text-buttonPrimary">full potential</Text>
            </Text>
            <Text
              style={{ fontFamily: "MontserratAlternates_400Regular" }}
              className="text-textLight text-sm leading-6"
            >
              Everything you need to train smarter and stay consistent.
            </Text>
          </View>

          {/* Plan Card */}
          <View className=" border border-buttonPrimary/30 rounded-2xl p-5 mb-6 flex-row justify-between items-center">
            <View>
              <Text
                style={{ fontFamily: "MontserratAlternates_700Bold" }}
                className="text-buttonPrimary text-xs tracking-widest uppercase mb-1"
              >
                {planTitle}
              </Text>
              <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-textLight text-sm">
                Cancel anytime
              </Text>
            </View>
            <View className="items-end">
              {isProductLoading ? (
                <ActivityIndicator color="#D6EBEB" size="small" />
              ) : (
                <>
                  <Text
                    style={{ fontFamily: "MontserratAlternates_700Bold" }}
                    className="text-white text-3xl leading-8"
                  >
                    {price}
                  </Text>
                  <Text
                    style={{ fontFamily: "MontserratAlternates_400Regular" }}
                    className="text-textLight text-xs mt-0.5"
                  >
                    / {period}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Features */}
          <View>
            {FEATURES.map((feature, index) => (
              <View
                key={feature.label}
                className="flex-row items-center py-3"
                style={{
                  borderBottomWidth: index < FEATURES.length - 1 ? 1 : 0,
                  borderBottomColor: "rgba(255,255,255,0.06)",
                  gap: 14,
                }}
              >
                <View className="w-8 h-8 rounded-lg bg-buttonPrimary/10 items-center justify-center">
                  <Ionicons name={feature.icon} size={16} color="#D6EBEB" />
                </View>
                <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-white/80 text-sm">
                  {feature.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={subscribe}
            disabled={isLoading || isProductLoading}
            className={`w-full rounded-3xl py-4 px-6 items-center justify-center flex-row mb-4 ${
              isLoading || isProductLoading ? "bg-buttonSecondary" : "bg-buttonPrimary active:bg-white"
            }`}
            style={{ gap: 8 }}
          >
            {isLoading && <ActivityIndicator color="#262135" size="small" />}
            <Text
              style={{ fontFamily: "MontserratAlternates_700Bold" }}
              className={`text-md ${isLoading || isProductLoading ? "text-textLight" : "text-gray-800"}`}
            >
              {buttonLabel}
            </Text>
          </TouchableOpacity>

          <Text
            style={{ fontFamily: "MontserratAlternates_400Regular" }}
            className="text-textLight text-center text-xs leading-5"
          >
            Renews automatically · Cancel anytime{"\n"}
            By continuing you agree to our Terms &amp; Privacy Policy
          </Text>

          <TouchableOpacity onPress={handleSignOut} disabled={isLoading} className="mt-4 self-center">
            <Text style={{ fontFamily: "MontserratAlternates_400Regular" }} className="text-textLight/50 text-xs">
              Sign out
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
