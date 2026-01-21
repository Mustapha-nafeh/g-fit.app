import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";

// GET AVAILABLE CHALLENGES - Get all available challenges (POST method)
export const getAvailableChallengesApi = async () => {
  const response = await apiClient.post("/challenges/get-available-challenges");
  return response.data;
};

// JOIN CHALLENGE - Join a challenge
export const joinChallengeApi = async (challengeData) => {
  const response = await apiClient.post("/challenges/join-challenge", challengeData);
  return response.data;
};

// GET CHALLENGE HISTORY - Get user's challenge history with pagination (POST method)
export const getChallengeHistoryApi = async (params = { page: 1 }) => {
  const response = await apiClient.post("/challenges/get-challenge-history", params);
  return response.data;
};

// LEAVE CHALLENGE - Leave a challenge
export const leaveChallengeApi = async (challengeData) => {
  const response = await apiClient.post("/challenges/leave-challenge", challengeData);
  return response.data;
};

// GET ACTIVE CHALLENGE - Get current active challenge details
export const getActiveChallengeApi = async () => {
  const response = await apiClient.get("/challenges/get-active-challenge");
  return response.data;
};

// GET FAMILIES LEADERBOARD - Get families leaderboard for a challenge
export const getFamiliesLeaderboardApi = async (challengeId) => {
  const response = await apiClient.post("/challenges/get-families-leaderboard", { challenge_id: challengeId });
  return response.data;
};

// HOOKS

// Get Available Challenges Hook (Mutation)
export const useGetAvailableChallenges = () => {
  return useMutation({
    mutationFn: getAvailableChallengesApi,
    onSuccess: (data) => {
      console.log("Available challenges loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading available challenges:", error);
    },
  });
};

// Get Challenge History Hook (Mutation)
export const useGetChallengeHistory = () => {
  return useMutation({
    mutationFn: getChallengeHistoryApi,
    onSuccess: (data) => {
      console.log("Challenge history loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading challenge history:", error);
    },
  });
};

// Get Active Challenge Hook (Mutation)
export const useGetActiveChallenge = () => {
  return useMutation({
    mutationFn: getActiveChallengeApi,
    onSuccess: (data) => {
      console.log("Active challenge loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading active challenge:", error);
    },
  });
};

// Get Families Leaderboard Hook (Mutation)
export const useGetFamiliesLeaderboard = () => {
  return useMutation({
    mutationFn: getFamiliesLeaderboardApi,
    onSuccess: (data) => {
      console.log("Families leaderboard loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading families leaderboard:", error);
    },
  });
};

// Join Challenge Hook
export const useJoinChallenge = () => {
  return useMutation({
    mutationFn: joinChallengeApi,
    onSuccess: (data) => {
      console.log("Challenge joined successfully:", data);
    },
    onError: (error) => {
      console.error("Error joining challenge:", error);
    },
  });
};

// Leave Challenge Hook
export const useLeaveChallenge = () => {
  return useMutation({
    mutationFn: leaveChallengeApi,
    onSuccess: (data) => {
      console.log("Challenge left successfully:", data);
    },
    onError: (error) => {
      console.error("Error leaving challenge:", error);
    },
  });
};
