import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import apiClient from "./apiClient";

// GET ARTICLES
export const articlesApi = async (type) => {
  const response = await apiClient.post("/content/get-articles", type);
  return response.data;
};

// GET ARTICLE BY SLUG
export const articleBySlugApi = async (slug) => {
  const response = await apiClient.post("/content/get-article", { slug: slug });
  return response.data;
};

// GET WORKOUTS
export const workoutsApi = async (type) => {
  const response = await apiClient.post("/content/get-workouts", type);
  return response.data;
};

// GET WORKOUTS BY ID
export const workoutByIdApi = async (slug) => {
  const response = await apiClient.post("/content/get-workout", { slug: slug });
  return response.data;
};

// GET BUNNY VIDEO SIGNED URL
export const getVideoTokenApi = async (videoId) => {
  const response = await apiClient.get(`/content/video-token?video_id=${videoId}`);
  return response.data;
};

// ARTICLES HOOK
export const useGetArticles = (type = "kids", enabled = true) => {
  return useQuery({
    queryKey: ["articles", type],
    queryFn: () => articlesApi({ type }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ARTICLE BY SLUG HOOK
export const useGetArticleBySlug = (slug, enabled = true) => {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => articleBySlugApi(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// WORKOUTS HOOK
export const useGetWorkouts = (type = "kids", enabled = true) => {
  return useQuery({
    queryKey: ["workouts", type],
    queryFn: () => workoutsApi({ type }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// WORKOUT BY ID HOOK
export const useGetWorkoutById = (slug, enabled = true) => {
  return useQuery({
    queryKey: ["workout", slug],
    queryFn: () => workoutByIdApi(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// BUNNY VIDEO SIGNED URL HOOK
export const useGetVideoToken = (videoId, enabled = true) => {
  return useQuery({
    queryKey: ["video-token", videoId],
    queryFn: () => getVideoTokenApi(videoId),
    enabled: enabled && !!videoId,
    staleTime: 4 * 60 * 1000, // refresh before typical 5-min token expiry
    cacheTime: 5 * 60 * 1000,
    retry: 1,
  });
};
