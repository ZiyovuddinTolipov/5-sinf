"use client";

import { RefreshCw, Trophy } from "lucide-react";
import { useRankings } from "@/hooks/use-rankings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingsTable } from "@/components/rankings/rankings-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function RankingsPage() {
  const { data: rankings, isLoading, refetch, isRefetching } = useRankings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reytinglar</h1>
          <p className="text-muted-foreground mt-1">
            O&apos;quvchilar reytingi — Top 100
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Yangilash
        </Button>
      </div>

      <Card className="shadow-sm border-0 shadow-black/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-base font-medium">
              Reyting jadvali
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <RankingsTable rankings={rankings ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
