import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Profile } from "../types";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get<Profile | null>("/api/profile");
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [userId]);

  const updateProfile = async (
    updates: Partial<Pick<Profile, "full_name" | "avatar_url">>,
  ) => {
    if (!userId) return { error: "No user ID" };
    try {
      const data = await api.patch<Profile>("/api/profile", updates);
      setProfile(data);
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  };

  return { profile, loading, refetch: fetch, updateProfile };
}
