import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import { api, resolveAssetUrl } from "../lib/api";

const CACHE_DIR = FileSystem.documentDirectory + "lesson-pdfs/";

export function usePDFCache(
  lessonId: string,
  pdfUrl: string | null,
  userId: string | undefined,
) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const localFilePath = CACHE_DIR + `${lessonId}.pdf`;

  useEffect(() => {
    checkCache();
  }, [lessonId]);

  const checkCache = async () => {
    try {
      const info = await FileSystem.getInfoAsync(localFilePath);
      if (info.exists) setLocalUri(localFilePath);
    } catch {
      // not cached
    }
  };

  const downloadPDF = async () => {
    if (!pdfUrl || !userId) return;
    const absolute = resolveAssetUrl(pdfUrl);
    if (!absolute) return;

    setDownloading(true);
    setProgress(0);

    try {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }

      const downloadResult = await FileSystem.createDownloadResumable(
        absolute,
        localFilePath,
        {},
        (dp) => {
          const p = dp.totalBytesWritten / dp.totalBytesExpectedToWrite;
          setProgress(p);
        },
      ).downloadAsync();

      if (downloadResult?.uri) setLocalUri(downloadResult.uri);

      try {
        await api.post("/api/user-lessons", {
          lesson_id: lessonId,
          downloaded: true,
          downloaded_version: 1,
        });
      } catch {
        // best effort
      }
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  const clearCache = async () => {
    try {
      await FileSystem.deleteAsync(localFilePath, { idempotent: true });
      setLocalUri(null);
    } catch {
      // ignore
    }
  };

  return { localUri, downloading, progress, downloadPDF, clearCache };
}
