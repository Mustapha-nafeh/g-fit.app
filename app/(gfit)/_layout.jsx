import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as secureStore from "expo-secure-store";
import { useGlobalContext } from "../../context/GlobalContext";
import { useEffect } from "react";

export default function GfitLayout() {
  const { member, setMember } = useGlobalContext();

  useEffect(() => {
    const loadMember = async () => {
      try {
        const stored = await secureStore.getItemAsync("member");
        if (stored) {
          const parsed = JSON.parse(stored);
          setMember(parsed);
        } else {
          setMember(null); // optional: clear if not found
        }
      } catch (error) {
        console.error("Error loading member from SecureStore", error);
      }
    };

    loadMember();
  }, [setMember]); // run once on layout mount
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F59E0B", // Yellow/gold color for active
        tabBarInactiveTintColor: "#FFFFFF", // White for inactive
        tabBarStyle: {
          backgroundColor: "#4C4A6B", // Purple-gray background
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
          shadowOpacity: 0,
          minHeight: 100,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          bottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "fitness" : "fitness-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "analytics" : "analytics-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
