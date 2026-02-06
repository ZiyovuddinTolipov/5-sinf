import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useTests } from "../../../../hooks/useTests";
import { TestCard } from "../../../../components/TestCard";
import { LoadingSpinner } from "../../../../components/LoadingSpinner";
import { Colors } from "../../../../constants/colors";
import type { TestWithSubject } from "../../../../types";

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

export default function SubjectTestsScreen() {
  const { subjectId, subjectName } = useLocalSearchParams<{
    subjectId: string;
    subjectName: string;
  }>();
  const [search, setSearch] = useState("");
  const { tests, loading, refetch } = useTests(subjectId);

  const filteredTests = useMemo(() => {
    if (!search.trim()) return tests;
    const q = search.toLowerCase();
    return tests.filter((t) => t.name.toLowerCase().includes(q));
  }, [tests, search]);

  const { active, upcoming, closed } = groupTests(filteredTests);

  const sections: { title: string; data: TestWithSubject[] }[] = [];
  if (active.length > 0) sections.push({ title: "Faol testlar", data: active });
  if (upcoming.length > 0) sections.push({ title: "Kutilmoqda", data: upcoming });
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
    <>
      <Stack.Screen options={{ title: subjectName ?? "Testlar" }} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Test qidirish..."
            placeholderTextColor={Colors.mutedLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.mutedLight} />
            </TouchableOpacity>
          )}
        </View>

        {loading && allItems.length === 0 ? (
          <LoadingSpinner />
        ) : allItems.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={48} color={Colors.mutedLight} />
            <Text style={styles.emptyText}>
              {search ? "Testlar topilmadi" : "Bu fanda testlar yo'q"}
            </Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.foreground,
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
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.mutedLight,
  },
});
