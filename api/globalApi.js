import { useQuery } from "@tanstack/react-query";
import apiClient from "./apiClient";

// Countries
export const getCountriesApi = async (loginData) => {
    const response = await apiClient.get("/get-countries");
    return response.data;
};

// Countries HOOK
export const useGetCountries = () => {
    const query = useQuery({
        queryFn: getCountriesApi,
        queryKey: ["countries"],
    });
    return query;
};
