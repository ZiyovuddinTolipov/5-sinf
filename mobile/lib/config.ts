import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string };

export const API_URL: string =
  extra.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
