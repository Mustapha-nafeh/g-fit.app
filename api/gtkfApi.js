import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import apiClient from "./apiClient";

// GET ARTICLES
export const articlesApi = async (type) => {
  const response = await apiClient.post("/content/get-articles", type);
  return response.data;
};

// GET ARTICLE BY ID
export const articleByIdApi = async (id) => {
  const response = await apiClient.post("/content/get-article-by-id", id);
  return response.data;
};

// GET WORKOUTS
export const workoutsApi = async (type) => {
  const response = await apiClient.post("/content/get-workouts", type);
  return response.data;
};

// GET WORKOUTS BY ID
export const workoutByIdApi = async (id) => {
  const response = await apiClient.post("/content/get-workout-by-id", id);
  return response.data;
};

// ARTICLES HOOK
export const useGetArticles = () => {
  const mutation = useMutation({
    mutationFn: articlesApi,
  });
  return mutation;
};

// ARTICLE BY ID HOOK
export const useGetArticleById = () => {
  const mutation = useMutation({
    mutationFn: articleByIdApi,
  });
  return mutation;
};

// WORKOUTS HOOK
export const useGetWorkouts = () => {
  const mutation = useMutation({
    mutationFn: workoutsApi,
  });
  return mutation;
};

// WORKOUT BY ID HOOK
export const useGetWorkoutByIdApi = () => {
  const mutation = useMutation({
    mutationFn: workoutByIdApi,
  });
  return mutation;
};
