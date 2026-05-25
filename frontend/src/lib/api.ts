/**
 * API client for communicating with the FastAPI backend.
 * Falls back gracefully if the backend is not running.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        ok: false,
        error: body?.detail || `HTTP ${res.status}: ${res.statusText}`,
      };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to connect to backend. Is the server running?",
    };
  }
}

import type {
  HardwareInfo,
  ModelRecommendation,
  AnalysisSession,
  ImageResult,
  ExportOptions,
  CreateSessionResponse,
} from "@/types";

export const api = {
  getThumbnailUrl: (imageId: string) =>
    `${API_BASE}/api/thumbnail/${imageId}`,

  getImageUrl: (sessionId: string, imageId: string) =>
    `${API_BASE}/api/session/${sessionId}/image/${imageId}`,

  // Hardware
  getHardware: () =>
    request<HardwareInfo>("/api/hardware"),

  getModelRecommendation: () =>
    request<ModelRecommendation>("/api/hardware/recommend-model"),

  // Sessions
  createSession: () =>
    request<CreateSessionResponse>("/api/session/create", { method: "POST" }),

  getSession: (id: string) =>
    request<AnalysisSession>(`/api/session/${id}`),

  listSessions: () =>
    request<AnalysisSession[]>("/api/sessions"),

  deleteSession: (id: string) =>
    request<{ status: string }>(`/api/session/${id}`, { method: "DELETE" }),

  // Images
  loadFiles: (sessionId: string, path?: string) =>
    request<{ images: ImageResult[] }>(`/api/session/${sessionId}/load-files`, {
      method: "POST",
      body: JSON.stringify({ path }),
    }),

  uploadFiles: (sessionId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return fetch(`${API_BASE}/api/session/${sessionId}/upload-files`, {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        return {
          ok: false,
          error: body?.detail || `HTTP ${res.status}`,
        } as const;
      }
      return { ok: true, data: await res.json() } as const;
    });
  },

  // Analysis
  analyze: (sessionId: string, model?: string) =>
    request<{ session: AnalysisSession }>(
      `/api/session/${sessionId}/analyze`,
      { method: "POST", body: JSON.stringify({ model }) }
    ),

  getResults: (sessionId: string) =>
    request<{ session: AnalysisSession; images: ImageResult[] }>(`/api/session/${sessionId}/results`),

  // Overrides
  override: (sessionId: string, imageId: string, decision: string) =>
    request(`/api/session/${sessionId}/override`, {
      method: "POST",
      body: JSON.stringify({ image_id: imageId, decision }),
    }),

  // Export
  exportResults: (sessionId: string, options: ExportOptions) =>
    request<{ download_url: string }>(`/api/session/${sessionId}/export`, {
      method: "POST",
      body: JSON.stringify(options),
    }),
};
