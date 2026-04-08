import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import apiClient from "./apiClient";

// Verify Purchase API
export const verifyPurchaseApi = async (purchase) => {
  const response = await apiClient.post("/purchases/verify-purchase", purchase);
  return response.data;
};

// VERIFY HOOK
export const useVerifyPurchase = () => {
  const mutation = useMutation({
    mutationFn: verifyPurchaseApi,
  });
  return mutation;
};
