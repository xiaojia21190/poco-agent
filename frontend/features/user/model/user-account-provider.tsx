"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { ApiError } from "@/lib/errors";
import { buildHomePath, buildLoginPath } from "@/features/auth";
import { userService } from "@/features/user/api/user-api";
import type { UserCredits, UserProfile } from "@/features/user/types";

interface UserAccountContextValue {
  profile: UserProfile | null;
  credits: UserCredits | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserAccountContext = React.createContext<UserAccountContextValue | null>(
  null,
);

interface UserAccountProviderProps {
  lng: string;
  children: React.ReactNode;
}

export function UserAccountProvider({
  lng,
  children,
}: UserAccountProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [credits, setCredits] = React.useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextProfile, nextCredits] = await Promise.all([
        userService.getProfile(),
        userService.getCredits(),
      ]);
      if (nextProfile === null) {
        router.replace(buildLoginPath(lng, pathname || buildHomePath(lng)));
        setProfile(null);
        setCredits(null);
        return;
      }
      setProfile(nextProfile);
      setCredits(nextCredits);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        router.replace(buildLoginPath(lng, pathname || buildHomePath(lng)));
        setProfile(null);
        setCredits(null);
      } else {
        console.error("Failed to load current user", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [lng, pathname, router]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = React.useCallback(async () => {
    try {
      await userService.logout();
    } finally {
      setProfile(null);
      setCredits(null);
      router.replace(buildLoginPath(lng, buildHomePath(lng)));
      router.refresh();
    }
  }, [lng, router]);

  const value = React.useMemo(
    () => ({ profile, credits, isLoading, refresh, logout }),
    [credits, isLoading, logout, profile, refresh],
  );

  return (
    <UserAccountContext.Provider value={value}>
      {children}
    </UserAccountContext.Provider>
  );
}

export function useUserAccountContext(): UserAccountContextValue {
  const context = React.useContext(UserAccountContext);
  if (context === null) {
    throw new Error("useUserAccount must be used within UserAccountProvider");
  }
  return context;
}
