import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import type { RankingEntry } from "../types";

interface Props {
  rankings: RankingEntry[];
  currentUserId?: string;
}

function getMedalColor(position: number): string | null {
  if (position === 1) return "#FFD700";
  if (position === 2) return "#C0C0C0";
  if (position === 3) return "#CD7F32";
  return null;
}

function RankingItem({ item, isMe }: { item: RankingEntry; isMe: boolean }) {
  const medal = getMedalColor(item.rank_position ?? 0);
  const displayName = item.full_name ?? "Foydalanuvchi";
  const avatarUrl = item.avatar_url;

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={styles.positionContainer}>
        {medal ? (
          <Ionicons name="medal" size={20} color={medal} />
        ) : (
          <Text style={styles.position}>{item.rank_position ?? "\u2014"}</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, isMe && styles.avatarPlaceholderMe]}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.userName, isMe && styles.textMe]} numberOfLines={1}>
          {displayName}
        </Text>
      </View>
      <View style={styles.stats}>
        <Text style={[styles.points, isMe && styles.textMe]}>
          {item.total_points}
        </Text>
        <Text style={styles.label}>ball</Text>
      </View>
      <View style={styles.stats}>
        <Text style={[styles.testCount, isMe && styles.textMe]}>
          {item.tests_taken}
        </Text>
        <Text style={styles.label}>test</Text>
      </View>
    </View>
  );
}

export function RankingList({ rankings, currentUserId }: Props) {
  return (
    <View style={styles.list}>
      {rankings.map((item) => (
        <RankingItem
          key={item.id}
          item={item}
          isMe={item.user_id === currentUserId}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  rowMe: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  positionContainer: {
    width: 28,
    alignItems: "center",
  },
  position: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.muted,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderMe: {
    backgroundColor: Colors.primary,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.muted,
  },
  userName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.foreground,
  },
  textMe: {
    color: Colors.primary,
  },
  stats: {
    alignItems: "center",
    minWidth: 36,
  },
  points: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.foreground,
  },
  testCount: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.foreground,
  },
  label: {
    fontSize: 10,
    color: Colors.mutedLight,
  },
});
