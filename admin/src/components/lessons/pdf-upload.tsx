"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useUploadPdf } from "@/hooks/use-lessons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PdfUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string | null;
  lessonTitle: string;
}

export function PdfUpload({
  open,
  onOpenChange,
  lessonId,
  lessonTitle,
}: PdfUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadPdf = useUploadPdf();

  const handleFile = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile || !lessonId) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    const result = await uploadPdf.mutateAsync({ lessonId, formData });
    if ("success" in result) {
      setSelectedFile(null);
      onOpenChange(false);
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) setSelectedFile(null);
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>PDF yuklash — {lessonTitle}</DialogTitle>
        </DialogHeader>
        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-primary" />
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                PDF faylni bu yerga tashlang yoki tanlang
              </p>
            </div>
          )}
          <input
            type="file"
            accept="application/pdf"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadPdf.isPending}
          >
            {uploadPdf.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              "Yuklash"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
