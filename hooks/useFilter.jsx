import { useState, useMemo, useEffect } from "react";

const useFilterData = (initialData = [], initialFields = {}) => {
  const [filterFields, setFilterFieldsState] = useState(initialFields);

  const setFilterFields = (field, value) => {
    if (typeof field === "string") {
      setFilterFieldsState((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else if (typeof field === "object") {
      setFilterFieldsState(field);
    } else if (typeof field === "string" && field.includes(".")) {
      const [key, subKey] = field.split(".");
      setFilterFieldsState((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [subKey]: value,
        },
      }));
    }
  };

  // Get nested property value using dot notation path
  const getNestedValue = (obj, path) => {
    if (!path || !obj) return undefined;

    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) return undefined;
      result = result[key];
    }

    return result;
  };

  const filteredData = useMemo(() => {
    // If data is undefined, return undefined to indicate loading state
    if (initialData === undefined) {
      return undefined;
    }

    // Ensure we have an array to work with
    const dataArray = Array.isArray(initialData) ? initialData : [];

    return dataArray.filter((item) => {
      if (!item || Object.keys(filterFields).length === 0) return true;

      return Object.entries(filterFields).every(([field, value]) => {
        if (!value) return true;

        // Handle nested fields
        const itemValue = field.includes(".") ? getNestedValue(item, field) : item[field];

        if (itemValue === undefined || itemValue === null) {
          return false;
        }

        if (typeof itemValue === "string") {
          return itemValue.toLowerCase().includes(value.toLowerCase());
        }

        if (typeof itemValue === "number") {
          return itemValue === Number(value);
        }

        if (Array.isArray(itemValue)) {
          return itemValue.some((v) => v?.toString().toLowerCase().includes(value.toLowerCase()));
        }

        if (typeof itemValue === "boolean") {
          return itemValue.toString() === value.toString();
        }

        return itemValue === value;
      });
    });
  }, [initialData, filterFields]);

  return {
    filterFields,
    setFilterFields,
    filteredData,
  };
};

// Debounced value hook for search functionality
export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useFilterData;
