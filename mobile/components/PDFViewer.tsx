import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "../constants/colors";
import { usePDFCache } from "../hooks/usePDFCache";
import { useAuth } from "../lib/auth";

interface Props {
  lessonId: string;
  pdfUrl: string | null;
  title?: string;
  onClose: () => void;
}

export function PDFViewer({ lessonId, pdfUrl, title, onClose }: Props) {
  const { user } = useAuth();
  const { localUri, downloading, progress, downloadPDF, clearCache } =
    usePDFCache(lessonId, pdfUrl, user?.id);
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState(false);

  // Auto-download PDF when opened
  useEffect(() => {
    if (!localUri && !downloading && pdfUrl) {
      downloadPDF();
    }
  }, []);

  if (!pdfUrl) {
    return (
      <View style={styles.error}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
        <Text style={styles.errorText}>PDF mavjud emas</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Yopish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleOpenInBrowser = async () => {
    await WebBrowser.openBrowserAsync(pdfUrl);
  };

  const handleShare = async () => {
    if (!localUri) return;
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(localUri);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Keshni tozalash",
      "Yuklab olingan faylni o'chirishni xohlaysizmi?",
      [
        { text: "Bekor qilish", style: "cancel" },
        { text: "O'chirish", onPress: clearCache, style: "destructive" },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.foreground} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ?? "PDF"}
        </Text>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleOpenInBrowser}>
            <Ionicons name="open-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          {localUri && (
            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={22} color={Colors.foreground} />
            </TouchableOpacity>
          )}
          {localUri && (
            <TouchableOpacity style={styles.headerBtn} onPress={handleClearCache}>
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {downloading && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      )}

      {localUri && !webError ? (
        <>
          {webLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>PDF yuklanmoqda...</Text>
            </View>
          )}
          <WebView
            source={{ uri: localUri }}
            style={styles.webview}
            originWhitelist={["*"]}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            onLoadStart={() => setWebLoading(true)}
            onLoadEnd={() => setWebLoading(false)}
            onError={() => {
              setWebLoading(false);
              setWebError(true);
            }}
          />
        </>
      ) : (
        <View style={styles.fallback}>
          {downloading ? (
            <>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.fallbackPercent}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.fallbackText}>PDF yuklanmoqda...</Text>
            </>
          ) : (
            <>
              <Ionicons
                name="document-text-outline"
                size={64}
                color={Colors.mutedLight}
              />
              <Text style={styles.fallbackTitle}>{title ?? "PDF"}</Text>
              <Text style={styles.fallbackText}>
                PDFni brauzerda ochish uchun tugmani bosing
              </Text>
              <TouchableOpacity
                style={styles.openBtn}
                onPress={handleOpenInBrowser}
              >
                <Ionicons name="open-outline" size={20} color={Colors.white} />
                <Text style={styles.openBtnText}>Brauzerda ochish</Text>
              </TouchableOpacity>
              {localUri && (
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={handleShare}
                >
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.shareBtnText}>Ulashish</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.foreground,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.muted,
  },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.foreground,
    textAlign: "center",
    marginTop: 8,
  },
  fallbackPercent: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },
  fallbackText: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
  },
  openBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
});
