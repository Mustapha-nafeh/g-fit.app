import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import apiClient from "./apiClient";

// LOGIN
export const loginApi = async (loginData) => {
  const response = await apiClient.post("/login", loginData);
  return response.data;
};

// REGISTER
export const registerApi = async (registerData) => {
  const response = await apiClient.post("/register", registerData);
  return response.data;
};

// OTP VERIFICATION
export const checkOtpApi = async (otpData) => {
  const response = await apiClient.post("/check-otp", otpData);
  return response.data;
};

// RESEND OTP
export const resendOtpApi = async (emailData) => {
  const response = await apiClient.post("/resend-otp", emailData);
  return response.data;
};

// LOGIN HOOK
export const useLogin = () => {
  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      console.log("login", data);
    },
    onError: (error) => {
      console.error("login error", error);
    },
  });
  return mutation;
};

// REGISTER HOOK
export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      console.log("Registration successful", data);
    },
    onError: (error) => {
      console.error("Registration failed", error);
    },
  });
  return mutation;
};

// OTP VERIFICATION HOOK
export const useCheckOtp = () => {
  const mutation = useMutation({
    mutationFn: checkOtpApi,
    onSuccess: (data) => {
      console.log("OTP verification successful", data);
      router.replace("/(auth)/login");
    },
    onError: (error) => {
      console.error("OTP verification failed", error);
    },
  });
  return mutation;
};

// RESEND OTP HOOK
export const useResendOtp = () => {
  const mutation = useMutation({
    mutationFn: resendOtpApi,
  });
  return mutation;
};
