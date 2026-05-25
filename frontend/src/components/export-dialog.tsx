"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  Table,
  Code,
  Check,
  Copy,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { ExportOptions } from "@/types";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  acceptedCount: number;
  rejectedCount: number;
}

export function ExportDialog({
  open,
  onClose,
  sessionId,
  acceptedCount,
  rejectedCount,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportOptions["format"]>("txt");
  const [includeRejected, setIncludeRejected] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<{ download_url?: string; filename?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const res = await api.exportResults(sessionId, {
      format,
      include_rejected: includeRejected,
      include_scores: true,
    });
    if (res.ok && res.data) {
      setResult(res.data);
    }
    setIsExporting(false);
  };

  const handleCopyPath = () => {
    if (result?.download_url) {
      navigator.clipboard.writeText(
        `${window.location.origin}${result.download_url}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formats = [
    {
      value: "txt" as const,
      label: "Plain Text",
      description: "One filename per line",
      icon: FileText,
      badge: "Simple",
    },
    {
      value: "csv" as const,
      label: "CSV",
      description: "Filename, score, status, reasons",
      icon: Table,
      badge: "Structured",
    },
    {
      value: "json" as const,
      label: "JSON",
      description: "Full structured data with metadata",
      icon: Code,
      badge: "Detailed",
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} title="Export Results">
      {!result ? (
        <div className="space-y-5">
          <p className="text-sm text-gray-500">
            Choose a format and export your cull decisions.
          </p>

          {/* Format selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
              Export Format
            </label>
            <div className="grid gap-2">
              {formats.map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = format === fmt.value;
                return (
                  <button
                    key={fmt.value}
                    onClick={() => setFormat(fmt.value)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-blue-200 bg-blue-50 ring-1 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {fmt.label}
                        </span>
                        <Badge variant="neutral">{fmt.badge}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{fmt.description}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {acceptedCount} accepted
                </p>
                {rejectedCount > 0 && (
                  <p className="text-xs text-gray-500">
                    {rejectedCount} rejected
                    {includeRejected ? " (included)" : " (excluded)"}
                  </p>
                )}
              </div>
              {rejectedCount > 0 && (
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRejected}
                    onChange={(e) => setIncludeRejected(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  Include rejected
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} isLoading={isExporting}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <Check className="mx-auto h-8 w-8 text-green-500" />
            <h3 className="mt-2 font-semibold text-green-800">
              Export Complete
            </h3>
            <p className="mt-1 text-sm text-green-600">
              {result.filename}
            </p>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleCopyPath}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Download Link
              </>
            )}
          </Button>

          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
