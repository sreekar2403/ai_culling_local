"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  FolderOpen,
  Upload,
  Cpu,
  Monitor,
  HardDrive,
  Clock,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useSessionStore } from "@/store/session";
import type { AnalysisSession, HardwareInfo } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const setSessionInStore = useSessionStore((s) => s.setSession);
  const modelRecommendation = useSessionStore((s) => s.modelRecommendation);
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [hardware, setLocalHardware] = useState<HardwareInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const s = useSessionStore.getState();

    // Load hardware info
    const hwRes = await api.getHardware();
    if (hwRes.ok && hwRes.data) {
      setLocalHardware(hwRes.data);
      s.setHardware(hwRes.data);
    }

    // Load model recommendation
    const recRes = await api.getModelRecommendation();
    if (recRes.ok && recRes.data) {
      s.setModelRecommendation(recRes.data);
    }

    // Load sessions
    const sesRes = await api.listSessions();
    if (sesRes.ok && sesRes.data) {
      setSessions(sesRes.data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createNewSession = async () => {
    const res = await api.createSession();
    if (res.ok && res.data?.session) {
      setSessionInStore(res.data.session);
      router.push(`/session/${res.data.session.id}`);
    } else {
      setError(res.error || "Failed to create session");
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const res = await api.deleteSession(sessionId);
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } else {
      setError(res.error || "Failed to delete session");
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Start a new culling session or continue a previous one.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={loadData} isLoading={isLoading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={createNewSession}>
              <Plus className="h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Hardware Info */}
        {hardware && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-500" />
                <h2 className="font-semibold">Your Hardware</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <Cpu className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-gray-500">CPU</div>
                    <div className="text-sm font-medium truncate max-w-[200px] text-gray-900" title={hardware.cpu}>
                      {hardware.cpu}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <HardDrive className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-gray-500">RAM</div>
                    <div className="text-sm font-medium text-gray-900">{hardware.ram_gb} GB</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <Monitor className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-gray-500">GPU</div>
                    <div className="text-sm font-medium text-gray-900">
                      {hardware.gpu || "Not detected"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                  <Monitor className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium text-gray-500">VRAM</div>
                    <div className="text-sm font-medium text-gray-900">
                      {hardware.vram_gb ? `${hardware.vram_gb} GB` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Model recommendation */}
              {modelRecommendation && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                        Recommended Model
                      </span>
                      <p className="mt-0.5 text-sm font-semibold text-blue-900">
                        {modelRecommendation.model_name}
                      </p>
                      <p className="text-xs text-blue-700">
                        {modelRecommendation.parameter_size} ·{" "}
                        {modelRecommendation.quantization} ·{" "}
                        {modelRecommendation.speed_rating} speed
                      </p>
                    </div>
                    {modelRecommendation.reason && (
                      <p className="text-xs text-blue-600 max-w-[200px] text-right">
                        {modelRecommendation.reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={createNewSession}
            className="flex items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 text-left hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Open a Folder</h3>
              <p className="text-sm text-gray-500">
                Point to a directory of photos to cull
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </button>

          <button
            onClick={createNewSession}
            className="flex items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-white p-6 text-left hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
              <Upload className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Upload Photos</h3>
              <p className="text-sm text-gray-500">
                Drag and drop or select files from your machine
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-green-500 transition-colors" />
          </button>
        </div>

        {/* Recent Sessions */}
        <div>
          <h2 className="mb-4 font-semibold text-gray-900">Recent Sessions</h2>
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No sessions yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first culling session to get started.
              </p>
              <Button className="mt-6" onClick={createNewSession}>
                <Plus className="h-4 w-4" />
                Create Session
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/session/${session.id}`)}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/session/${session.id}`)}
                  className="group flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 text-left hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-gray-900">
                      Session{" "}
                      <span className="font-mono text-xs text-gray-500">
                        {session.id.slice(0, 8)}
                      </span>
                    </div>
                    <Badge
                      variant={
                        session.status === "complete"
                          ? "accept"
                          : session.status === "error"
                            ? "reject"
                            : "neutral"
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{session.total_images} images</span>
                    {session.analysis_duration_ms && (
                      <span>
                        {(session.analysis_duration_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="rounded-lg p-1.5 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      title="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
