import { useMutation } from "@tanstack/react-query";
import apiClient from "./apiClient";

// STORE NOTIFICATION TOKEN
export const storeNotificationTokenApi = async (tokenData) => {
  const response = await apiClient.post("/notification/store-notification-token", tokenData);
  return response.data;
};

// STORE NOTIFICATION TOKEN HOOK
export const useStoreNotificationToken = () => {
  const mutation = useMutation({
    mutationFn: storeNotificationTokenApi,
  });
  return mutation;
};
