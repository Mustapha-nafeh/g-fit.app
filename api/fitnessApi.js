import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";

// POST STEPS - Submit daily steps
export const saveStepsApi = async (stepData) => {
  const response = await apiClient.post("/steps/submit-steps", stepData);
  return response.data;
};

// GET STEPS - Get steps for a specific date or date range
export const getStepsApi = async (params) => {
  const response = await apiClient.post("/fitness/get-steps", params);
  return response.data;
};

// GET WEEKLY STEPS - Get steps for the past week
export const getWeeklyStepsApi = async (params) => {
  const response = await apiClient.post("/fitness/get-weekly-steps", params);
  return response.data;
};

// GET MEMBER STEPS - Get steps for a specific member within date range
export const getMemberStepsApi = async (params) => {
  const response = await apiClient.post("/steps/get-member-steps", params);
  return response.data;
};

// GET FAMILY STEPS - Get family members' steps
export const getFamilyStepsApi = async (params) => {
  const response = await apiClient.post("/fitness/get-family-steps", params);
  return response.data;
};

// UPDATE DAILY GOAL - Set daily step goal
export const updateStepGoalApi = async (goalData) => {
  const response = await apiClient.post("/fitness/update-step-goal", goalData);
  return response.data;
};

// GET STEP HISTORY - Get step history with pagination
export const getStepHistoryApi = async (params) => {
  const response = await apiClient.post("/fitness/get-step-history", params);
  return response.data;
};

// GET USER CHALLENGES - Get challenges user is participating in
export const getUserChallengesApi = async (params) => {
  const response = await apiClient.post("/fitness/get-user-challenges", params);
  return response.data;
};

// GET AVAILABLE CHALLENGES - Get all available challenges to join
export const getAvailableChallengesApi = async (params) => {
  const response = await apiClient.post("/fitness/get-available-challenges", params);
  return response.data;
};

// JOIN CHALLENGE - Join a challenge
export const joinChallengeApi = async (challengeData) => {
  const response = await apiClient.post("/fitness/join-challenge", challengeData);
  return response.data;
};

// LEAVE CHALLENGE - Leave a challenge
export const leaveChallengeApi = async (challengeData) => {
  const response = await apiClient.post("/fitness/leave-challenge", challengeData);
  return response.data;
};

// GET CHALLENGE PROGRESS - Get detailed progress for a specific challenge
export const getChallengeProgressApi = async (params) => {
  const response = await apiClient.post("/fitness/get-challenge-progress", params);
  return response.data;
};

// UPDATE CHALLENGE PROGRESS - Update user's progress in a challenge
export const updateChallengeProgressApi = async (progressData) => {
  const response = await apiClient.post("/fitness/update-challenge-progress", progressData);
  return response.data;
};

// GET FAMILY CHALLENGE LEADERBOARD - Get family members' progress in challenges
export const getFamilyChallengeLeaderboardApi = async (params) => {
  const response = await apiClient.post("/fitness/get-family-challenge-leaderboard", params);
  return response.data;
};

// HOOKS

// Save Steps Hook
export const useSaveSteps = () => {
  const mutation = useMutation({
    mutationFn: saveStepsApi,
    onSuccess: (data) => {
      console.log("Steps saved successfully:", data);
    },
    onError: (error) => {
      console.error("Error saving steps:", error);
    },
  });
  return mutation;
};

// Get Steps Hook
export const useGetSteps = () => {
  const mutation = useMutation({
    mutationFn: getStepsApi,
  });
  return mutation;
};

// Get Weekly Steps Hook
export const useGetWeeklySteps = () => {
  const mutation = useMutation({
    mutationFn: getWeeklyStepsApi,
  });
  return mutation;
};

// Get Member Steps Hook
export const useGetMemberSteps = () => {
  const mutation = useMutation({
    mutationFn: getMemberStepsApi,
  });
  return mutation;
};

// Get Family Steps Hook
export const useGetFamilySteps = () => {
  const mutation = useMutation({
    mutationFn: getFamilyStepsApi,
  });
  return mutation;
};

// Update Step Goal Hook
export const useUpdateStepGoal = () => {
  const mutation = useMutation({
    mutationFn: updateStepGoalApi,
    onSuccess: (data) => {
      console.log("Step goal updated successfully:", data);
    },
    onError: (error) => {
      console.error("Error updating step goal:", error);
    },
  });
  return mutation;
};

// Get Step History Hook (using useQuery for caching)
export const useGetStepHistory = (params, enabled = true) => {
  const query = useQuery({
    queryFn: () => getStepHistoryApi(params),
    queryKey: ["stepHistory", params],
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
  return query;
};

// Get User Challenges Hook
export const useGetUserChallenges = () => {
  const mutation = useMutation({
    mutationFn: getUserChallengesApi,
    onSuccess: (data) => {
      console.log("User challenges retrieved successfully:", data);
    },
    onError: (error) => {
      console.error("Error getting user challenges:", error);
    },
  });

  return mutation;
};

// Get Available Challenges Hook
export const useGetAvailableChallenges = () => {
  const mutation = useMutation({
    mutationFn: getAvailableChallengesApi,
    onSuccess: (data) => {
      console.log("Available challenges retrieved successfully:", data);
    },
    onError: (error) => {
      console.error("Error getting available challenges:", error);
    },
  });

  return mutation;
};

// Join Challenge Hook
export const useJoinChallenge = () => {
  const mutation = useMutation({
    mutationFn: joinChallengeApi,
    onSuccess: (data) => {
      console.log("Challenge joined successfully:", data);
    },
    onError: (error) => {
      console.error("Error joining challenge:", error);
    },
  });

  return mutation;
};

// Leave Challenge Hook
export const useLeaveChallenge = () => {
  const mutation = useMutation({
    mutationFn: leaveChallengeApi,
    onSuccess: (data) => {
      console.log("Challenge left successfully:", data);
    },
    onError: (error) => {
      console.error("Error leaving challenge:", error);
    },
  });

  return mutation;
};

// Get Challenge Progress Hook
export const useGetChallengeProgress = () => {
  const mutation = useMutation({
    mutationFn: getChallengeProgressApi,
    onSuccess: (data) => {
      console.log("Challenge progress retrieved successfully:", data);
    },
    onError: (error) => {
      console.error("Error getting challenge progress:", error);
    },
  });

  return mutation;
};
