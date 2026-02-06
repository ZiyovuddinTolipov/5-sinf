"use client";

import type { RankingEntry } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RankingsTableProps {
  rankings: RankingEntry[];
}

function getRankBadge(position: number | null) {
  if (position === 1) return <Badge className="bg-yellow-500 text-white">1-o&apos;rin</Badge>;
  if (position === 2) return <Badge className="bg-gray-400 text-white">2-o&apos;rin</Badge>;
  if (position === 3) return <Badge className="bg-amber-700 text-white">3-o&apos;rin</Badge>;
  return <span>{position ?? "—"}</span>;
}

export function RankingsTable({ rankings }: RankingsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">O&apos;rin</TableHead>
          <TableHead>Ism</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Umumiy ball</TableHead>
          <TableHead>Testlar soni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rankings.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              Hozircha reyting ma&apos;lumotlari yo&apos;q
            </TableCell>
          </TableRow>
        ) : (
          rankings.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{getRankBadge(entry.rank_position)}</TableCell>
              <TableCell className="font-medium">
                {entry.user_name ?? "Noma'lum"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {entry.user_email ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{entry.total_points} ball</Badge>
              </TableCell>
              <TableCell>{entry.tests_taken}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
