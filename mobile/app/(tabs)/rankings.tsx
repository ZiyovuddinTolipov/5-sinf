import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";
import { useRankings, useMyRanking } from "../../hooks/useRankings";
import { RankingList } from "../../components/RankingList";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Colors } from "../../constants/colors";

export default function RankingsScreen() {
  const { user } = useAuth();
  const { rankings, loading, refetch } = useRankings(50);
  const { ranking: myRanking } = useMyRanking(user?.id);

  if (loading && rankings.length === 0) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} />
      }
    >
      {myRanking && (
        <View style={styles.myRankCard}>
          <Ionicons name="trophy" size={28} color={Colors.warning} />
          <View style={styles.myRankInfo}>
            <Text style={styles.myRankLabel}>Sizning o'rningiz</Text>
            <Text style={styles.myRankValue}>
              #{myRanking.rank_position ?? "—"} — {myRanking.total_points} ball
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        Top {rankings.length} ta o'quvchi
      </Text>

      {rankings.length === 0 ? (
        <Text style={styles.emptyText}>Reyting ma'lumotlari yo'q</Text>
      ) : (
        <RankingList rankings={rankings} currentUserId={user?.id} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  myRankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.warningLight,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    marginBottom: 20,
  },
  myRankInfo: {
    flex: 1,
  },
  myRankLabel: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: "500",
    marginBottom: 2,
  },
  myRankValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.foreground,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.mutedLight,
    textAlign: "center",
    paddingVertical: 40,
  },
});
