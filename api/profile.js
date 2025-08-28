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
