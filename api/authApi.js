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

// FORGOT PASSWORD
export const forgotPasswordApi = async (emailData) => {
  const response = await apiClient.post("/forget-password", emailData);
  return response.data;
};

// LOGIN HOOK
export const useLogin = () => {
  const mutation = useMutation({
    mutationFn: loginApi,
  });
  return mutation;
};

// REGISTER HOOK
export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: registerApi,
  });
  return mutation;
};

// OTP VERIFICATION HOOK
export const useCheckOtp = () => {
  const mutation = useMutation({
    mutationFn: checkOtpApi,
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

// FORGOT PASSWORD HOOK
export const useForgotPassword = () => {
  const mutation = useMutation({
    mutationFn: forgotPasswordApi,
  });
  return mutation;
};
