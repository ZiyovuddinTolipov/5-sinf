import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSubjects } from "../../../hooks/useSubjects";
import { useTests } from "../../../hooks/useTests";
import { TestCard } from "../../../components/TestCard";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { Colors } from "../../../constants/colors";
import type { TestWithSubject } from "../../../types";

function groupTests(tests: TestWithSubject[]) {
  const now = new Date();
  const active: TestWithSubject[] = [];
  const upcoming: TestWithSubject[] = [];
  const closed: TestWithSubject[] = [];

  for (const t of tests) {
    const start = new Date(t.start_time);
    const end = new Date(t.end_time);
    if (now < start) upcoming.push(t);
    else if (now <= end) active.push(t);
    else closed.push(t);
  }

  return { active, upcoming, closed };
}

export default function TestsScreen() {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const { subjects } = useSubjects();
  const { tests, loading, refetch } = useTests(selectedSubject);
  const { active, upcoming, closed } = groupTests(tests);

  const sections: { title: string; data: TestWithSubject[] }[] = [];
  if (active.length > 0) sections.push({ title: "Faol testlar", data: active });
  if (upcoming.length > 0)
    sections.push({ title: "Kutilmoqda", data: upcoming });
  if (closed.length > 0) sections.push({ title: "Yopilgan", data: closed });

  const allItems: (
    | { type: "header"; title: string }
    | { type: "test"; test: TestWithSubject }
  )[] = [];
  for (const section of sections) {
    allItems.push({ type: "header", title: section.title });
    for (const test of section.data) {
      allItems.push({ type: "test", test });
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipScroll}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedSubject && styles.chipActive]}
          onPress={() => setSelectedSubject(undefined)}
        >
          <Text
            style={[
              styles.chipText,
              !selectedSubject && styles.chipTextActive,
            ]}
          >
            Barchasi
          </Text>
        </TouchableOpacity>
        {subjects.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.chip,
              selectedSubject === s.id && styles.chipActive,
            ]}
            onPress={() => setSelectedSubject(s.id)}
          >
            <Text
              style={[
                styles.chipText,
                selectedSubject === s.id && styles.chipTextActive,
              ]}
            >
              {s.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && allItems.length === 0 ? (
        <LoadingSpinner />
      ) : allItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Testlar topilmadi</Text>
        </View>
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item, i) =>
            item.type === "header" ? `h-${item.title}` : item.test.id
          }
          renderItem={({ item }) => {
            if (item.type === "header") {
              return <Text style={styles.sectionTitle}>{item.title}</Text>;
            }
            return (
              <TestCard
                test={item.test}
                onPress={() => router.push(`/tests/${item.test.id}`)}
              />
            );
          }}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chipScroll: {
    flexGrow: 0,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chips: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.muted,
  },
  chipTextActive: {
    color: Colors.white,
  },
  list: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.foreground,
    marginTop: 8,
    marginBottom: 10,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: Colors.mutedLight,
  },
});
