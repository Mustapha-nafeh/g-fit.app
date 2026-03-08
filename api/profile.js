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
export const addFamilyMemberApi = async (first_name) => {
  const response = await apiClient.post("/add-family-member", first_name);
  return response.data;
};

// PROFILE
export const getFamilyMemberApi = async () => {
  const response = await apiClient.post("/get-family-member");
  return response.data;
};

// PROFILE
export const updateFamilyMemberApi = async () => {
  const response = await apiClient.post("/update-family-member");
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

// PROFILE
export const updateMemberProfileApi = async (memberData) => {
  const response = await apiClient.post("/update-family-member", memberData);
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
    onSuccess: (data) => {
      console.log("Family info updated successfully:", data);
    },
    onError: (error) => {
      console.error("Error updating family info:", error);
    },
  });
  return mutation;
};

// Update Member Profile Hook
export const useUpdateMemberProfile = () => {
  const mutation = useMutation({
    mutationFn: updateMemberProfileApi,
    onSuccess: (data) => {
      console.log("Member profile updated successfully:", data);
    },
    onError: (error) => {
      console.error("Error updating member profile:", error);
    },
  });
  return mutation;
};
