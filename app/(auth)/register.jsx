import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRegister } from "../../api/authApi";
import { showToast } from "../../constants";
import * as securestore from "expo-secure-store";

const RegisterScreen = () => {
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { data, isLoading, isError, mutate } = useRegister();
  const [error, setError] = useState("");

  const validatePassword = (confirm) => {
    if (confirm !== password) {
      setError("Passwords do not match");
    } else {
      setError("");
    }
  };

  const handleRegister = (familyName, email, password) => {
    mutate(
      { family_name: familyName, email, password },
      {
        onSuccess: (data) => {
          showToast("success", "Registration Successful", "You have registered successfully!");

          // Extract the actual token string from the object
          const tokenKey = data.data.token_key;
          console.log("Extracted token key:", tokenKey);
          securestore.setItemAsync("token_key", tokenKey);

          router.replace("/(auth)/otp");
        },
        onError: (error) => {
          showToast("error", "Registration Failed", error.response?.data?.message || "An error occurred");
        },
      }
    );
  };

  const handleBack = () => {
    router.back();
  };

  const handleLoginNow = () => {
    router.replace("/(auth)/login");
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-12">
            <Image source={require("../../assets/Ellipse1.png")} className=" absolute top-0 left-0" />

            {/* Header with Back Button */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={handleBack}
                className="w-12 h-12 rounded-2xl border border-gray-400 justify-center items-center"
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Content Container */}
            <View className="flex-1 justify-center min-h-[600px]">
              {/* Footprint Icon */}
              <View className="items-center mb-8">
                <View className="w-16 h-16 rounded-full border-2 border-gray-400 justify-center items-center">
                  <Ionicons name="footsteps" size={28} color="white" />
                </View>
              </View>

              {/* Welcome Text */}
              <View className="mb-12">
                <Text
                  style={{ fontFamily: "MontserratAlternates_700Bold" }}
                  className="text-white text-3xl text-left mb-2"
                >
                  Hello! Register to get
                </Text>
                <Text style={{ fontFamily: "MontserratAlternates_700Bold" }} className="text-white text-3xl text-left">
                  started
                </Text>
              </View>

              {/* Input Fields */}
              <View className="mb-8">
                {/* Family Name Input */}
                <TextInput
                  value={familyName}
                  onChangeText={setFamilyName}
                  placeholder="Family Name"
                  placeholderTextColor="#9CA3AF"
                  style={{ fontFamily: "MontserratAlternates_400Regular" }}
                  className="w-full bg-gray-700/50 text-white pb-2 h-14 px-6 rounded-2xl mb-4 text-base"
                  autoCapitalize="words"
                />

                {/* Email Input */}
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  style={{ fontFamily: "MontserratAlternates_400Regular" }}
                  className="w-full bg-gray-700/50 text-white pb-2 h-14  px-6 rounded-2xl mb-4 text-base"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Password Input */}
                <View className="relative mb-4">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    style={{ fontFamily: "MontserratAlternates_400Regular" }}
                    className="w-full bg-gray-700/50 text-white pb-2 h-14 px-6 pr-12 rounded-2xl text-base"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-4 top-4">
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      validatePassword(text);
                    }}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    style={{ fontFamily: "MontserratAlternates_400Regular" }}
                    className="w-full bg-gray-700/50 text-white pb-2 h-14 px-6 pr-12 rounded-2xl text-base"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4"
                  >
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                {error ? <Text className="text-red-500 mt-2 text-center">{error}</Text> : null}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={() => handleRegister(familyName, email, password)}
                className={`w-full py-4 px-6 rounded-2xl mb-8 ${
                  isLoading || error !== "" || confirmPassword === "" || familyName === ""
                    ? "bg-gray-400"
                    : "bg-gray-200 active:bg-white"
                }`}
                disabled={isLoading || error !== "" || confirmPassword === "" || familyName === ""}
              >
                <Text
                  style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                  className="text-gray-800 text-center text-lg"
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Login Link */}
            <View className="pb-8">
              <TouchableOpacity onPress={handleLoginNow} className="active:opacity-70">
                <Text
                  style={{ fontFamily: "MontserratAlternates_400Regular" }}
                  className="text-white text-center text-base"
                >
                  Already have an account?{" "}
                  <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-yellow-300">
                    Login Now
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default RegisterScreen;
