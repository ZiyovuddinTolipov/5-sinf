import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth";
import { useProfile } from "../../hooks/useProfile";
import { useMyRanking } from "../../hooks/useRankings";
import { useSubjects } from "../../hooks/useSubjects";
import { useTests } from "../../hooks/useTests";
import { useLessons } from "../../hooks/useLessons";
import { SubjectCard } from "../../components/SubjectCard";
import { TestCard } from "../../components/TestCard";
import { LessonCard } from "../../components/LessonCard";
import { PDFViewer } from "../../components/PDFViewer";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Colors } from "../../constants/colors";
import type { LessonWithSubject } from "../../types";

export default function HomeScreen() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { ranking } = useMyRanking(user?.id);
  const { subjects, loading: subjectsLoading, refetch: refetchSubjects } = useSubjects();
  const { tests, refetch: refetchTests } = useTests();
  const { lessons, refetch: refetchLessons } = useLessons();
  const [refreshing, setRefreshing] = useState(false);
  const [pdfLesson, setPdfLesson] = useState<LessonWithSubject | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSubjects(), refetchTests(), refetchLessons()]);
    setRefreshing(false);
  };

  const now = new Date();
  const activeTests = tests
    .filter((t) => new Date(t.start_time) <= now && now <= new Date(t.end_time))
    .slice(0, 3);

  const recentLessons = lessons.slice(0, 3);

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "";

  if (subjectsLoading && subjects.length === 0) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Salom, {displayName}!</Text>
              <Text style={styles.subtitle}>Bugun nima o'rganamiz?</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Colors.warningLight }]}>
                <Ionicons name="trophy" size={24} color={Colors.warning} />
                <Text style={styles.statValue}>{ranking?.rank_position ?? "\u2014"}</Text>
                <Text style={styles.statLabel}>O'rin</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="star" size={24} color={Colors.primary} />
                <Text style={styles.statValue}>{ranking?.total_points ?? 0}</Text>
                <Text style={styles.statLabel}>Ball</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="checkmark-done" size={24} color={Colors.success} />
                <Text style={styles.statValue}>{ranking?.tests_taken ?? 0}</Text>
                <Text style={styles.statLabel}>Testlar</Text>
              </View>
            </View>

            {activeTests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Faol testlar</Text>
                  <TouchableOpacity onPress={() => router.push("/tests")}>
                    <Text style={styles.seeAll}>Barchasi</Text>
                  </TouchableOpacity>
                </View>
                {activeTests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    onPress={() => router.push(`/tests/${test.id}`)}
                  />
                ))}
              </View>
            )}

            {recentLessons.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Oxirgi darsliklar</Text>
                  <TouchableOpacity onPress={() => router.push("/lessons")}>
                    <Text style={styles.seeAll}>Barchasi</Text>
                  </TouchableOpacity>
                </View>
                {recentLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onPress={() => setPdfLesson(lesson)}
                  />
                ))}
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fanlar</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <SubjectCard
            subject={item}
            onPress={() => router.push(`/subject/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {pdfLesson && (
        <Modal visible={!!pdfLesson} animationType="slide">
          <PDFViewer
            lessonId={pdfLesson.id}
            pdfUrl={pdfLesson.pdf_url}
            title={pdfLesson.title}
            onClose={() => setPdfLesson(null)}
          />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
  },
  greeting: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.foreground,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
});
