import { create } from "zustand";
import type { ImageResult, AnalysisSession, HardwareInfo, ModelRecommendation } from "@/types";

interface SessionState {
  // Current session
  session: AnalysisSession | null;
  images: ImageResult[];
  selectedImageId: string | null;

  // Hardware
  hardware: HardwareInfo | null;
  modelRecommendation: ModelRecommendation | null;

  // UI state
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;

  // Actions
  setSession: (session: AnalysisSession) => void;
  setImages: (images: ImageResult[]) => void;
  addImages: (images: ImageResult[]) => void;
  setSelectedImageId: (id: string | null) => void;
  updateImageDecision: (imageId: string, decision: "accept" | "reject" | "uncertain") => void;
  updateImageScore: (imageId: string, score: number, reasons: string[]) => void;
  setHardware: (info: HardwareInfo) => void;
  setModelRecommendation: (rec: ModelRecommendation) => void;
  setLoading: (loading: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  session: null,
  images: [],
  selectedImageId: null,
  hardware: null,
  modelRecommendation: null,
  isLoading: false,
  isAnalyzing: false,
  error: null,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),
  setImages: (images) => set({ images }),
  addImages: (images) =>
    set((state) => ({
      images: [...state.images, ...images].filter(
        (img, idx, arr) => arr.findIndex((i) => i.id === img.id) === idx
      ),
    })),

  setSelectedImageId: (id) => set({ selectedImageId: id }),

  updateImageDecision: (imageId, decision) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId ? { ...img, human_decision: decision } : img
      ),
    })),

  updateImageScore: (imageId, score, reasons) =>
    set((state) => ({
      images: state.images.map((img) =>
        img.id === imageId
          ? {
              ...img,
              score,
              score_reasons: reasons,
              ai_decision:
                score >= (state.session?.threshold.accept ?? 70)
                  ? "accept"
                  : score < (state.session?.threshold.reject ?? 40)
                    ? "reject"
                    : "uncertain",
            }
          : img
      ),
    })),

  setHardware: (info) => set({ hardware: info }),
  setModelRecommendation: (rec) => set({ modelRecommendation: rec }),
  setLoading: (loading) => set({ isLoading: loading }),
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
