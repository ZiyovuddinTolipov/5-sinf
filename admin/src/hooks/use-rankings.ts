"use client";

import { useQuery } from "@tanstack/react-query";
import { getRankings } from "@/actions/rankings";

export function useRankings() {
  return useQuery({
    queryKey: ["rankings"],
    queryFn: () => getRankings(),
  });
}
