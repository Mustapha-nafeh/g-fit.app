import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StatusBar, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useCheckOtp, useResendOtp } from "../../api/authApi";
import * as securestore from "expo-secure-store";
import { showToast } from "../../constants";
import { router } from "expo-router";

const OTPVerificationScreen = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const { mutate, isLoading, isError, data } = useCheckOtp(); // CHECK OTP
  const { mutate: resendOtp } = useResendOtp(); // RESEND OTP
  const token_key = securestore.getItemAsync("token_key");

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join("");
    console.log("Verifying OTP:", token_key);
    mutate(
      { otp: otpCode, token_key: token_key },
      {
        onSuccess: (data) => {
          console.log("OTP verified successfully:", data);
          showToast("success", "OTP Verified", "Your OTP has been verified successfully!");
          router.replace("(selection)/select-app");
          securestore.setItemAsync("access_token", data.data.access_token);
          // Navigate to the next screen or perform other actions
        },
        onError: (error) => {
          console.log("OTP verification failed:", error);
          showToast("error", "OTP Verification Failed", error.response?.data?.message || "An error occurred");
          // Show error message to the user
        },
      }
    );
  };

  const handleResend = () => {
    console.log("Resend code pressed", token_key);
    resendOtp(
      { token_key: token_key },
      {
        onSuccess: (data) => {
          console.log("OTP resent successfully");
          showToast("success", "OTP Resent", "A new OTP has been sent to your email.");
        },
        onError: (error) => {
          console.log("Resend OTP failed:", error);
          showToast("error", "Resend OTP Failed", error.response?.data?.message || "An error occurred");
        },
      }
    );
    // Clear OTP inputs
    setOtp(["", "", "", ""]);
    inputRefs.current[0].focus();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View className="bg-background flex-1 px-6 pt-12">
        <Image source={require("../../assets/Ellipse1.png")} className=" absolute top-0 left-0" />

        {/* Header with Back Button */}
        <View className="flex-row items-center mb-12">
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 rounded-2xl border border-gray-400 justify-center items-center"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content Container */}
        <View className="flex-1 justify-center">
          {/* Title */}
          <View className="mb-6">
            <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-3xl text-left mb-4">
              OTP Verification
            </Text>
            <Text
              style={{ fontFamily: "MontserratAlternates_400Regular" }}
              className="text-gray-300 text-base text-left leading-6"
            >
              Enter the verification code we just sent on your email address.
            </Text>
          </View>

          {/* OTP Input Boxes */}
          <View className="flex-row justify-between mb-12 px-2">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className={`w-16 h-16 bg-gray-700/50 text-white text-center text-xl rounded-2xl ${
                  digit ? "border-2 border-gray-400" : "border border-gray-600"
                }`}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            className="w-full bg-gray-200 py-4 px-6 rounded-2xl mb-8 active:bg-white"
            disabled={otp.some((digit) => !digit)}
          >
            <Text
              style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
              className="text-gray-800 text-center text-lg"
            >
              Verify
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Resend Link */}
        <View className="pb-8">
          <TouchableOpacity onPress={handleResend} className="active:opacity-70">
            <Text
              style={{ fontFamily: "MontserratAlternates_400Regular" }}
              className="text-white text-center text-base"
            >
              Didn't received code?{" "}
              <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-yellow-300">
                Resend
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default OTPVerificationScreen;
