"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeColor, ThemeMode } from "@/context/ThemeContext";
import {
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

export const ThemeCustomizer: React.FC = () => {
  const {
    themeColor,
    setThemeColor,
    themeMode,
    setThemeMode,
    currentTheme,
    allThemes,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleReset = () => {
    setThemeColor("blue");
    setThemeMode("light");
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all shadow-sm group"
        title="Change UI Theme & Accent Color"
        aria-label="UI Theme Customizer"
      >
        <div className="relative">
          <Palette className="w-3.5 h-3.5 text-blue-600 transition-transform group-hover:rotate-12" />
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-900"
            style={{ backgroundColor: currentTheme.hex }}
          />
        </div>
        <span className="hidden sm:inline">Theme</span>
      </button>

      {/* Popover Dialog */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: currentTheme.hex }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  UI Appearance & Color
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select brand accent & lighting mode
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              Display Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "light" as ThemeMode, label: "Daylight", icon: Sun },
                { id: "dark" as ThemeMode, label: "Control Room", icon: Moon },
                { id: "system" as ThemeMode, label: "System OS", icon: Laptop },
              ].map((mode) => {
                const Icon = mode.icon;
                const isActive = themeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setThemeMode(mode.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Presets Palette */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Manufacturing Accent Color
              </label>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {currentTheme.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {allThemes.map((theme) => {
                const isSelected = themeColor === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setThemeColor(theme.id as ThemeColor)}
                    className={`flex items-center space-x-2.5 p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 shadow-sm ring-1 ring-slate-900/10 dark:ring-white/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: theme.hex }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {theme.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {theme.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Pill */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
              Live Theme Preview
            </div>
            <div className="flex items-center justify-between gap-2">
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium text-xs shadow-sm">
                Primary Button
              </button>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium rounded-lg text-[11px] border border-blue-200 dark:border-blue-900">
                Badge Accent
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                Active Link
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Saved automatically
            </span>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
