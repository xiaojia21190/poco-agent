import { UserProfile, UserCredits } from "../api-types";

// Mock Data
const MOCK_PROFILE: UserProfile = {
  id: "u_123456",
  email: "user@opencowork.com",
  avatar: "",
  plan: "free",
  planName: "免费",
};

const MOCK_CREDITS: UserCredits = {
  total: "无限",
  free: "无限",
  dailyRefreshCurrent: 9999,
  dailyRefreshMax: 9999,
  refreshTime: "08:00",
};

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    // In a real app: return fetchApi<UserProfile>("/user/profile");
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_PROFILE), 500);
    });
  },

  getCredits: async (): Promise<UserCredits> => {
    // In a real app: return fetchApi<UserCredits>("/user/credits");
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_CREDITS), 500);
    });
  },
};
