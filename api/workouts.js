import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import apiClient from "./apiClient";

// GET SCHEDULE
export const getScheduleApi = async () => {
    const response = await apiClient.get("/get-schedule");
    return response.data;
};

// get Profile Hook
export const useGetSchedule = () => {
    const query = useQuery({
        queryFn: getScheduleApi,
        queryKey: ["schedule"],
    });
    return query;
};
