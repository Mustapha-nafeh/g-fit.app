import React, { useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function PaymentMethodPage() {
  const [selectedMethod, setSelectedMethod] = useState("creditcard");

  const handleBack = () => {
    router.back();
  };

  const handleAdd = () => {
    // Handle adding payment method
    console.log("Selected payment method:", selectedMethod);
    router.push({ pathname: "(selection)/card-details", params: { selectedMethod: selectedMethod } });
    // Navigate to next screen or handle payment setup
  };

  const paymentOptions = [
    {
      id: "paypal",
      label: "Paypal",
      icon: "logo-paypal",
    },
    {
      id: "visa",
      label: "Visa Card",
      icon: "card-outline",
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <View className=" h-full px-6">
          {/* Decorative circles */}
          <View className="absolute top-8 right-12">
            <View
              className="w-20 h-20 rounded-full opacity-20"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            />
            <View
              className="w-8 h-8 rounded-full opacity-30 absolute -bottom-2 -right-2"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            />
          </View>

          <View className="absolute top-32 right-16">
            <View
              className="w-16 h-16 rounded-full opacity-15"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            />
          </View>

          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            className="w-12 h-12 rounded-2xl border border-white/30 items-center justify-center mt-4"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Content */}
          <View className="flex-1 justify-center">
            {/* Title */}
            <View className="mb-6">
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-white text-3xl font-bold leading-tight mb-6"
              >
                Select your{"\n"}payment method.
              </Text>
              {/* <Text style={{ fontFamily: "MontserratAlternates_600SemiBold" }} className="text-gray-400 text-lg">
                Add new debit
              </Text> */}
            </View>

            {/* Payment Options */}
            <View className="">
              {paymentOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setSelectedMethod(option.id);
                    console.log(selectedMethod);
                  }}
                  className="flex-row items-center justify-between py-4"
                >
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 items-center justify-center mr-6">
                      <Ionicons name={option.icon} size={28} color="white" />
                    </View>
                    <Text
                      style={{ fontFamily: "MontserratAlternates_400Regular" }}
                      className="text-white text-2xl font-medium"
                    >
                      {option.label}
                    </Text>
                  </View>

                  <View
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedMethod === option.id ? "border-white bg-white" : "border-white/50"
                    }`}
                  >
                    {selectedMethod === option.id && (
                      <View className="flex-1 items-center justify-center">
                        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3a3052" }} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add Button */}
          <View className="pb-8">
            <TouchableOpacity
              onPress={handleAdd}
              className="rounded-2xl py-4 items-center border border-white/30"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <Text
                style={{ fontFamily: "MontserratAlternates_600SemiBold" }}
                className="text-white text-xl font-semibold"
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
