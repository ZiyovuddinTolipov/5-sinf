import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    setProfile(data as Profile | null);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, [userId]);

  const updateProfile = async (updates: Partial<Pick<Profile, "full_name" | "avatar_url">>) => {
    if (!userId) return { error: "No user ID" };

    const { error } = await supabase
      .from("profiles")
      .upsert(
        { user_id: userId, ...updates },
        { onConflict: "user_id" }
      );

    if (!error) {
      await fetch();
    }

    return { error: error?.message ?? null };
  };

  return { profile, loading, refetch: fetch, updateProfile };
}
