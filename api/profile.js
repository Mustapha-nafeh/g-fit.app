import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import apiClient from "./apiClient";

// PROFILE
export const getProfileApi = async () => {
  const response = await apiClient.get("/get-profile");
  return response.data;
};

// PROFILE
export const getFamilyMembersApi = async () => {
  const response = await apiClient.get("/get-family-members");
  return response.data;
};

// PROFILE
export const addFamilyMemberApi = async (memberData) => {
  const formData = new FormData();
  formData.append("username", memberData.username);
  if (memberData.image) {
    formData.append("image", {
      uri: memberData.image.uri,
      type: memberData.image.mimeType || "image/jpeg",
      name: memberData.image.fileName || "photo.jpg",
    });
  }
  const response = await apiClient.post("/add-family-member", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// PROFILE
export const getFamilyMemberApi = async () => {
  const response = await apiClient.post("/get-family-member");
  return response.data;
};

// PROFILE
export const updateFamilyMemberApi = async (memberData) => {
  const formData = new FormData();
  formData.append("token_key", memberData.token_key);
  formData.append("username", memberData.username);
  if (memberData.image) {
    formData.append("image", {
      uri: memberData.image.uri,
      type: memberData.image.mimeType || "image/jpeg",
      name: memberData.image.fileName || "photo.jpg",
    });
  }
  const response = await apiClient.post("/update-family-member", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// PROFILE
export const deleteFamilyMemberApi = async () => {
  const response = await apiClient.post("/delete-family-member");
  return response.data;
};

// PROFILE
export const updateFamilyInfoApi = async (familyData) => {
  const response = await apiClient.post("/update-family-info", familyData);
  return response.data;
};

// PROFILE - Update family profile with name, email, phone
export const updateFamilyProfileApi = async (profileData) => {
  const response = await apiClient.post("/update-profile", profileData);
  return response.data;
};

// PROFILE
export const updateMemberProfileApi = async (memberData) => {
  const formData = new FormData();
  formData.append("token_key", memberData.token_key);
  formData.append("username", memberData.username);
  if (memberData.image) {
    formData.append("image", {
      uri: memberData.image.uri,
      type: memberData.image.mimeType || "image/jpeg",
      name: memberData.image.fileName || "photo.jpg",
    });
  }
  const response = await apiClient.post("/update-family-member", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// AVATARS
export const getUnlockedAvatarsApi = async () => {
  const response = await apiClient.get("/avatars/unlocked");
  return response.data;
};

// AVATARS
export const selectAvatarApi = async (avatarData) => {
  const response = await apiClient.post("/avatars/select", avatarData);
  return response.data;
};

// get Profile Hook
export const useGetProfile = () => {
  const query = useQuery({
    queryFn: getProfileApi,
    queryKey: ["profile"],
  });
  return query;
};

// get Profile Hook
export const useGetFamilyMembers = () => {
  const query = useQuery({
    queryFn: getFamilyMembersApi,
    queryKey: ["family-members"],
  });
  return query;
};

// get Profile Hook
export const useGetFamilyMember = () => {
  const mutation = useMutation({
    mutationFn: getFamilyMemberApi,
  });
  return mutation;
};

// get Profile Hook
export const useAddFamilyMember = () => {
  const mutation = useMutation({
    mutationFn: addFamilyMemberApi,
  });
  return mutation;
};

// get Profile Hook
export const useUpdateProfile = () => {
  const mutation = useMutation({
    mutationFn: updateFamilyMemberApi,
  });
  return mutation;
};

// get Profile Hook
export const useDeleteProfile = () => {
  const mutation = useMutation({
    mutationFn: deleteFamilyMemberApi,
  });
  return mutation;
};

// Update Family Info Hook
export const useUpdateFamilyInfo = () => {
  const mutation = useMutation({
    mutationFn: updateFamilyInfoApi,
  });
  return mutation;
};

// Update Family Profile Hook (name, email, phone)
export const useUpdateFamilyProfile = () => {
  const mutation = useMutation({
    mutationFn: updateFamilyProfileApi,
  });
  return mutation;
};

// Update Member Profile Hook
export const useUpdateMemberProfile = () => {
  const mutation = useMutation({
    mutationFn: updateMemberProfileApi,
  });
  return mutation;
};

// Get Unlocked Avatars Hook
export const useGetUnlockedAvatars = () => {
  const query = useQuery({
    queryFn: getUnlockedAvatarsApi,
    queryKey: ["unlocked-avatars"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
  return query;
};

// Select Avatar Hook
export const useSelectAvatar = () => {
  const mutation = useMutation({
    mutationFn: selectAvatarApi,
  });
  return mutation;
};

// LEVELS
export const getLevelsApi = async () => {
  const response = await apiClient.get("/content/get-levels");
  return response.data;
};

// Get Levels Hook
export const useGetLevels = () => {
  return useQuery({
    queryFn: getLevelsApi,
    queryKey: ["levels"],
    staleTime: 60 * 60 * 1000, // 1 hour — levels rarely change
  });
};

// CANCEL SUBSCRIPTION
export const cancelSubscriptionApi = async () => {
  const response = await apiClient.post("/cancel-subscription");
  return response.data;
};

export const useCancelSubscription = () => {
  return useMutation({ mutationFn: cancelSubscriptionApi });
};

// CHANGE PASSWORD
export const changePasswordApi = async (data) => {
  const response = await apiClient.post("/change-password", data);
  return response.data;
};

export const useChangePassword = () => {
  return useMutation({ mutationFn: changePasswordApi });
};
