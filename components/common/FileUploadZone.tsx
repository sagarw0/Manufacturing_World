"use client";

import React, { useRef, useState } from "react";
import { DocumentAttachment } from "@/types/database.types";
import {
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  Trash2,
  Eye,
  Download,
  AlertCircle,
} from "lucide-react";

interface FileUploadZoneProps {
  attachments: DocumentAttachment[];
  onChange: (attachments: DocumentAttachment[]) => void;
  label?: string;
  description?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedCategories?: Array<"drawing" | "specification" | "cad_model" | "quote" | "test_cert" | "other">;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  attachments,
  onChange,
  label = "Upload Engineering Documents & Drawings",
  description = "Supports CAD (STEP, IGES, DXF), 2D Drawings (PDF), Specs (DOCX/XLSX), and Images (PNG, JPG) up to 25MB each.",
  maxFiles = 10,
  maxSizeMB = 25,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<DocumentAttachment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getCategory = (filename: string, mime: string): DocumentAttachment["file_category"] => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["step", "stp", "iges", "igs", "dxf", "dwg"].includes(ext)) return "cad_model";
    if (mime.includes("pdf") || ["pdf"].includes(ext)) return "drawing";
    if (mime.includes("image")) return "drawing";
    if (["xlsx", "xls", "csv", "doc", "docx"].includes(ext)) return "specification";
    return "other";
  };

  const processFiles = (fileList: FileList) => {
    setErrorMsg(null);
    if (attachments.length + fileList.length > maxFiles) {
      setErrorMsg(`Maximum of ${maxFiles} attachments allowed.`);
      return;
    }

    Array.from(fileList).forEach((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the ${maxSizeMB}MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newAttachment: DocumentAttachment = {
          id: "doc-" + Math.random().toString(36).substring(2, 9),
          name: file.name,
          url: result,
          size: file.size,
          mime_type: file.type || "application/octet-stream",
          file_category: getCategory(file.name, file.type),
          uploaded_at: new Date().toISOString(),
        };

        onChange([...attachments, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const renderFileIcon = (attachment: DocumentAttachment) => {
    if (attachment.mime_type.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    }
    if (attachment.file_category === "cad_model") {
      return <FileCode className="w-5 h-5 text-purple-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          {attachments.length}/{maxFiles} Files
        </span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
            : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.step,.stp,.iges,.igs,.dxf,.dwg,.xlsx,.xls,.csv,.doc,.docx"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center shadow-sm">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Click to select files
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {" "}or drag & drop here
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Images (PNG, JPG), Drawings (PDF), CAD (STEP, DXF) up to {maxSizeMB}MB
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                  {renderFileIcon(att)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                    {att.name}
                  </span>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span>{formatFileSize(att.size)}</span>
                    <span>•</span>
                    <span className="uppercase font-mono">{att.file_category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0 ml-2">
                {att.mime_type.startsWith("image/") && (
                  <button
                    type="button"
                    onClick={() => setPreviewItem(att)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                    title="Preview Image"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <a
                  href={att.url}
                  download={att.name}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-colors"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleRemove(att.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 transition-colors"
                  title="Remove File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {previewItem.name}
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
            </div>
            <div className="max-h-96 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="object-contain max-h-96 w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
