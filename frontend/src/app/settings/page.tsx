"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  Keyboard,
  Palette,
  Download,
  RefreshCw,
  Info,
  Save,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/session";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const store = useSessionStore();
  const [acceptThreshold, setAcceptThreshold] = useState(70);
  const [rejectThreshold, setRejectThreshold] = useState(40);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (store.session?.threshold) {
      setAcceptThreshold(store.session.threshold.accept);
      setRejectThreshold(store.session.threshold.reject);
    }
  }, [store.session]);

  const handleSave = () => {
    // Save to localStorage for persistence
    localStorage.setItem(
      "opc_thresholds",
      JSON.stringify({ accept: acceptThreshold, reject: rejectThreshold })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure the app to match your workflow.
          </p>
        </div>

        {/* Quality Thresholds */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold">Quality Thresholds</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900">
                  Accept Score
                </label>
                <span className="text-lg font-bold text-green-600">
                  ≥{acceptThreshold}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={acceptThreshold}
                onChange={(e) => setAcceptThreshold(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-green-500 cursor-pointer"
              />
              <p className="mt-1 text-xs text-gray-500">
                Images with a score at or above this threshold are auto-accepted.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-900">
                  Reject Score
                </label>
                <span className="text-lg font-bold text-red-600">
                  &lt;{rejectThreshold}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={rejectThreshold}
                onChange={(e) => setRejectThreshold(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-red-500 cursor-pointer"
              />
              <p className="mt-1 text-xs text-gray-500">
                Images below this threshold are auto-rejected.
              </p>
            </div>

            <Button onClick={handleSave}>
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save Thresholds"}
            </Button>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold">Keyboard Shortcuts</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { keys: "A", action: "Accept current image" },
                { keys: "R", action: "Reject current image" },
                { keys: "← / →", action: "Navigate between images" },
                { keys: "Esc", action: "Close preview / go back" },
                { keys: "Space", action: "Toggle accept/reject" },
              ].map((shortcut) => (
                <div
                  key={shortcut.keys}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2"
                >
                  <span className="text-sm text-gray-700">{shortcut.action}</span>
                  <kbd className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs font-mono font-medium text-gray-600 shadow-sm">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Defaults */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold">Export Defaults</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Configure your preferred export format and options.
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                Include scores in export
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                Include rejected images in export
              </label>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
