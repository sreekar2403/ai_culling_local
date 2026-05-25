"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ImageIcon,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Download,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Search,
  SlidersHorizontal,
  Loader2,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useSessionStore } from "@/store/session";
import type { ImageResult, Decision } from "@/types";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const store = useSessionStore();
  const sessionId = params.id as string;

  const [showPreview, setShowPreview] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [showPathInput, setShowPathInput] = useState(true);
  const [sortBy, setSortBy] = useState<"filename" | "score">("filename");
  const [filterBy, setFilterBy] = useState<"all" | "accept" | "reject" | "uncertain">("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPreview && selectedImageIndex !== null) {
        const images = getFilteredImages();
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
            break;
          case "ArrowRight":
            e.preventDefault();
            setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1));
            break;
          case "a":
          case "A":
            e.preventDefault();
            handleOverride(images[selectedImageIndex]?.id, "accept");
            break;
          case "r":
          case "R":
            e.preventDefault();
            handleOverride(images[selectedImageIndex]?.id, "reject");
            break;
          case "Escape":
            setShowPreview(false);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreview, selectedImageIndex, store.images]);

  const loadFolder = async () => {
    if (!folderPath.trim()) return;
    setIsScanning(true);
    store.setError(null);

    const res = await api.loadFiles(sessionId, folderPath.trim());
    if (res.ok && res.data) {
      store.setImages(res.data.images);
      setShowPathInput(false);
    } else {
      store.setError(res.error || "Failed to load folder");
    }
    setIsScanning(false);
  };

  const handleUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setIsScanning(true);
    store.setError(null);

    const res = await api.uploadFiles(sessionId, fileArray);
    if (res.ok && res.data) {
      store.setImages(res.data.images);
      setShowPathInput(false);
    } else {
      store.setError(res.error || "Failed to upload files");
    }
    setIsScanning(false);
  };

  const refreshResults = async () => {
    const resultsRes = await api.getResults(sessionId);
    if (resultsRes.ok && resultsRes.data) {
      store.setImages(resultsRes.data.images);
      const analyzedCount = resultsRes.data.images.filter(
        (img: ImageResult) => img.score !== null
      ).length;
      const total = resultsRes.data.images.length;
      setAnalysisProgress(Math.round((analyzedCount / total) * 100));

      if (analyzedCount >= total || resultsRes.data.session.status === "complete") {
        setIsAnalyzing(false);
        store.setAnalyzing(false);
      }
    } else {
      store.setError(resultsRes.error || "Failed to fetch results");
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    store.setAnalyzing(true);
    store.setError(null);

    const res = await api.analyze(sessionId);
    if (!res.ok) {
      setIsAnalyzing(false);
      store.setAnalyzing(false);
      store.setError(res.error || "Analysis failed");
    }
  };

  const handleOverride = (imageId: string, decision: Decision) => {
    api.override(sessionId, imageId, decision);
    store.updateImageDecision(imageId, decision);
  };

  const getDecisionBadge = (img: ImageResult) => {
    const decision = img.human_decision || img.ai_decision;
    if (decision === "accept") return { variant: "accept" as const, label: "Accept" };
    if (decision === "reject") return { variant: "reject" as const, label: "Reject" };
    return { variant: "uncertain" as const, label: "?" };
  };

  const getScoreVariant = (score: number | null) => {
    if (score === null) return "neutral" as const;
    if (score >= 70) return "success" as const;
    if (score >= 40) return "warning" as const;
    return "danger" as const;
  };

  const getFilteredImages = useCallback(() => {
    let images = [...store.images];

    // Sort
    if (sortBy === "score") {
      images.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else {
      images.sort((a, b) => a.filename.localeCompare(b.filename));
    }

    // Filter
    if (filterBy !== "all") {
      images = images.filter((img) => {
        const decision = img.human_decision || img.ai_decision;
        return decision === filterBy;
      });
    }

    return images;
  }, [store.images, sortBy, filterBy]);

  const filteredImages = getFilteredImages();
  const hasResults = store.images.some((img) => img.score !== null);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-900">
              Session <span className="font-mono text-xs text-gray-500">{sessionId.slice(0, 8)}</span>
            </span>
            <Badge variant="neutral">{store.images.length} images</Badge>
          </div>

          <div className="flex items-center gap-2">
            {store.images.length > 0 && !hasResults && !isAnalyzing && (
              <Button onClick={startAnalysis}>
                <Sparkles className="h-4 w-4" />
                Analyze with AI
              </Button>
            )}
            {isAnalyzing && (
              <Button variant="secondary" onClick={refreshResults}>
                <RefreshCw className="h-4 w-4" />
                Refresh Results
              </Button>
            )}
            {hasResults && !isAnalyzing && (
              <Button
                variant="secondary"
                onClick={() => router.push(`/session/${sessionId}?export=true`)}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Analysis progress bar */}
        {isAnalyzing && (
          <div className="px-4 sm:px-6 pb-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-xs text-gray-500">
                Analyzing images with AI...
              </span>
              <Progress value={analysisProgress} className="flex-1 max-w-[200px]" showLabel />
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1">
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {store.error && (
            <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{store.error}</span>
            </div>
          )}

          {/* Path input screen */}
          {showPathInput && (
            <div className="flex items-center justify-center p-8">
              <Card className="w-full max-w-lg">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <FolderOpen className="mx-auto h-12 w-12 text-gray-300" />
                    <h2 className="mt-4 text-lg font-semibold">Load Photos</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter the path to a folder containing your photos
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={folderPath}
                      onChange={(e) => setFolderPath(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && loadFolder()}
                      placeholder="C:\Users\Name\Pictures\Wedding"
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    <Button onClick={loadFolder} isLoading={isScanning}>
                      <Search className="h-4 w-4" />
                      Load
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <div className="mt-4">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400", "bg-blue-50"); }}
                      onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50"); }}
                      onDrop={async (e) => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50"); await handleUpload(e.dataTransfer.files); }}
                      className="cursor-pointer rounded-lg border-2 border-dashed border-gray-200 p-8 text-center transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Upload className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-2 text-sm text-gray-500">
                        Click to select or drag and drop files
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPEG, PNG, TIFF supported
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.tiff,.tif"
                      className="hidden"
                      onChange={(e) => e.target.files && handleUpload(e.target.files)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Thumbnail Grid */}
          {!showPathInput && (
            <div className="p-4 sm:p-6">
              {/* Toolbar */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="accept">
                    {store.images.filter((img) => (img.human_decision || img.ai_decision) === "accept").length} Accepted
                  </Badge>
                  <Badge variant="reject">
                    {store.images.filter((img) => (img.human_decision || img.ai_decision) === "reject").length} Rejected
                  </Badge>
                  <Badge variant="uncertain">
                    {store.images.filter((img) => (img.human_decision || img.ai_decision) === "uncertain").length} Uncertain
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as typeof filterBy)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium bg-white text-gray-600"
                  >
                    <option value="all">All</option>
                    <option value="accept">Accepted</option>
                    <option value="reject">Rejected</option>
                    <option value="uncertain">Uncertain</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium bg-white text-gray-600"
                  >
                    <option value="filename">By Name</option>
                    <option value="score" disabled={!hasResults}>
                      By Score {!hasResults ? "(analyze first)" : ""}
                    </option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-sm text-gray-500">
                    {store.images.length === 0
                      ? "No images found in this path."
                      : "No images match the current filter."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filteredImages.map((img, index) => {
                    const badge = getDecisionBadge(img);
                    return (
                      <motion.div
                        key={img.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setShowPreview(true);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && (setSelectedImageIndex(index), setShowPreview(true))}
                        className="group relative aspect-[3/2] cursor-pointer overflow-hidden rounded-lg border-2 bg-gray-100 transition-all hover:shadow-lg"
                        style={{
                          borderColor:
                            badge.variant === "accept"
                              ? "rgb(34 197 94)"
                              : badge.variant === "reject"
                                ? "rgb(239 68 68)"
                                : "rgb(234 179 8)",
                        }}
                      >
                        <img
                          src={api.getThumbnailUrl?.(img.id) || "/placeholder.svg"}
                          alt={img.filename}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23f3f4f6' width='300' height='200'/%3E%3Ctext x='150' y='110' text-anchor='middle' fill='%239ca3af' font-size='14'%3EImage%3C/text%3E%3C/svg%3E";
                          }}
                        />

                        {/* Badge overlay */}
                        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-1.5">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          {img.score !== null && (
                            <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-bold text-white">
                              {img.score}
                            </span>
                          )}
                        </div>

                        {/* Filename */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
                          <p className="truncate text-xs text-white">
                            {img.filename}
                          </p>
                        </div>

                        {/* Quick actions on hover */}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 group-hover:bg-black/20 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOverride(img.id, "accept");
                            }}
                            className="rounded-full bg-green-500 p-2 text-white hover:bg-green-600 shadow-lg"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOverride(img.id, "reject");
                            }}
                            className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex(index);
                              setShowPreview(true);
                            }}
                            className="rounded-full bg-white p-2 text-gray-700 hover:bg-gray-100 shadow-lg"
                          >
                            <ZoomIn className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full-screen Preview */}
      <AnimatePresence>
        {showPreview && selectedImageIndex !== null && (
          <motion.div
            ref={previewRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex bg-black/95"
          >
            <div className="flex flex-1 flex-col">
              {/* Preview toolbar */}
              <div className="flex h-14 items-center justify-between border-b border-white/10 bg-black/50 px-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-white/80">
                    {selectedImageIndex + 1} / {filteredImages.length}
                  </span>
                  <span className="text-sm text-white/50">
                    {filteredImages[selectedImageIndex]?.filename}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOverride(filteredImages[selectedImageIndex]?.id, "accept")}
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                      <Check className="h-4 w-4" />
                      Accept (A)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOverride(filteredImages[selectedImageIndex]?.id, "reject")}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                      Reject (R)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Image display */}
              <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
                {/* Previous */}
                {selectedImageIndex > 0 && (
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                    className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {/* Image */}
                <img
                  src={
                    filteredImages[selectedImageIndex]?.path
                      ? `/api/session/${sessionId}/image/${filteredImages[selectedImageIndex]?.id}`
                      : "/placeholder.svg"
                  }
                  alt={filteredImages[selectedImageIndex]?.filename || "Preview"}
                  className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23374151' width='800' height='600'/%3E%3Ctext x='400' y='310' text-anchor='middle' fill='%239ca3af' font-size='20'%3EPreview not available%3C/text%3E%3C/svg%3E";
                  }}
                />

                {/* Next */}
                {selectedImageIndex < filteredImages.length - 1 && (
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                    className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}
              </div>

              {/* Bottom info bar */}
              <div className="border-t border-white/10 bg-black/50 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {filteredImages[selectedImageIndex]?.score !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50">Score:</span>
                        <span className="text-lg font-bold text-white">
                          {filteredImages[selectedImageIndex]?.score}
                        </span>
                        <Progress
                          value={filteredImages[selectedImageIndex]?.score ?? 0}
                          variant={getScoreVariant(filteredImages[selectedImageIndex]?.score ?? null)}
                          className="w-24"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      {filteredImages[selectedImageIndex]?.dimensions && (
                        <span>
                          {filteredImages[selectedImageIndex]?.dimensions?.width} ×{" "}
                          {filteredImages[selectedImageIndex]?.dimensions?.height}
                        </span>
                      )}
                      <span>
                        {filteredImages[selectedImageIndex]?.file_size_bytes
                          ? `${(filteredImages[selectedImageIndex]!.file_size_bytes / 1024 / 1024).toFixed(1)} MB`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {filteredImages[selectedImageIndex]?.score_reasons.map((reason, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

