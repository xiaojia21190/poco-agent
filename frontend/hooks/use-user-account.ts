import { useState, useEffect } from "react";
import { userApi } from "@/lib/api/user";
import type { UserProfile, UserCredits } from "@/lib/api-types";

export function useUserAccount() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileData, creditsData] = await Promise.all([
          userApi.getProfile(),
          userApi.getCredits(),
        ]);

        setProfile(profileData);
        setCredits(creditsData);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return {
    profile,
    credits,
    isLoading,
  };
}
