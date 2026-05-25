/** Core type definitions for Ollama Photo Culler */

export interface ImageFile {
  id: string;
  path: string;
  filename: string;
  extension: string;
  file_size_bytes: number;
  dimensions: { width: number; height: number } | null;
  thumbnail_url: string;
  full_url: string;
}

export interface ImageResult extends ImageFile {
  score: number | null;
  score_reasons: string[];
  ai_decision: Decision;
  human_decision: Decision | null;
}

export type Decision = "accept" | "reject" | "uncertain";

export interface AnalysisSession {
  id: string;
  created_at: string;
  total_images: number;
  model_used: string;
  analysis_duration_ms: number | null;
  threshold: { accept: number; reject: number };
  status: "pending" | "scanning" | "analyzing" | "complete" | "error";
  error?: string;
}

export interface HardwareInfo {
  cpu: string;
  ram_gb: number;
  gpu: string | null;
  vram_gb: number | null;
  platform: string;
}

export interface ModelRecommendation {
  model_name: string;
  parameter_size: string;
  quantization: string;
  min_ram_gb: number;
  min_vram_gb: number;
  speed_rating: "fast" | "medium" | "slow";
  is_compatible: boolean;
  reason?: string;
}

export interface ExportOptions {
  format: "txt" | "csv" | "json";
  include_rejected: boolean;
  include_scores: boolean;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface CreateSessionResponse {
  session: AnalysisSession;
}
