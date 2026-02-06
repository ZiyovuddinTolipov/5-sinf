import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";
import { useProfile } from "../../hooks/useProfile";
import { useMyRanking } from "../../hooks/useRankings";
import { useMyTestResults } from "../../hooks/useMyTestResults";
import { TestResultCard } from "../../components/TestResultCard";
import { EditProfileModal } from "../../components/EditProfileModal";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Colors } from "../../constants/colors";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, refetch: refetchProfile, updateProfile } =
    useProfile(user?.id);
  const { ranking, refetch: refetchRanking } = useMyRanking(user?.id);
  const { results, loading: resultsLoading, refetch: refetchResults } =
    useMyTestResults(user?.id, 5);
  const [editVisible, setEditVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchRanking(), refetchResults()]);
    setRefreshing(false);
  };

  const handleSaveProfile = async (updates: {
    full_name: string;
    avatar_url: string | null;
  }) => {
    await updateProfile(updates);
  };

  if (profileLoading && !profile) return <LoadingSpinner />;

  const displayName =
    profile?.full_name ?? user?.email?.split("@")[0] ?? "Foydalanuvchi";
  const email = user?.email ?? "\u2014";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => setEditVisible(true)}
        >
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={12} color={Colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={22} color={Colors.warning} />
          <Text style={styles.statValue}>{ranking?.rank_position ?? "\u2014"}</Text>
          <Text style={styles.statLabel}>O'rin</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={22} color={Colors.primary} />
          <Text style={styles.statValue}>{ranking?.total_points ?? 0}</Text>
          <Text style={styles.statLabel}>Ball</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={22} color={Colors.success} />
          <Text style={styles.statValue}>{ranking?.tests_taken ?? 0}</Text>
          <Text style={styles.statLabel}>Testlar</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Oxirgi natijalar</Text>
        {resultsLoading ? (
          <View style={styles.loadingSection}>
            <LoadingSpinner />
          </View>
        ) : results.length === 0 ? (
          <Text style={styles.emptyText}>Hali testlar yechmadingiz</Text>
        ) : (
          results.map((result) => (
            <TestResultCard key={result.test_id} result={result} />
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Chiqish</Text>
      </TouchableOpacity>

      <EditProfileModal
        visible={editVisible}
        profile={profile}
        userId={user?.id ?? ""}
        onClose={() => setEditVisible(false)}
        onSave={handleSaveProfile}
      />
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
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.white,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.foreground,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: Colors.muted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.foreground,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.foreground,
    marginBottom: 12,
  },
  loadingSection: {
    height: 100,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.mutedLight,
    textAlign: "center",
    paddingVertical: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dangerLight,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.danger,
  },
});
