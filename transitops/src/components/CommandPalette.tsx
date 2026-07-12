"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, Truck, Users, Wrench, Fuel, BarChart3, Settings, Sparkles } from "lucide-react";
import { useTransitStore } from "@/lib/store";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { vehicles, drivers, trips } = useTransitStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setQuery("");
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Search filter
  const q = query.toLowerCase();

  const navigationItems = [
    { name: "Go to Dashboard", href: "/dashboard", icon: Compass },
    { name: "Go to Fleet Registry", href: "/fleet", icon: Truck },
    { name: "Go to Driver Profiles", href: "/drivers", icon: Users },
    { name: "Go to Trip Dispatcher", href: "/trips", icon: Compass },
    { name: "Go to Maintenance Kanban", href: "/maintenance", icon: Wrench },
    { name: "Go to Fuel & Expenses", href: "/fuel-expenses", icon: Fuel },
    { name: "Go to Reports & Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Go to Settings & RBAC", href: "/settings", icon: Settings },
  ].filter((item) => item.name.toLowerCase().includes(q));

  const matchedVehicles = vehicles
    .filter((v) => v.regNumber.toLowerCase().includes(q) || v.model.toLowerCase().includes(q))
    .slice(0, 3);

  const matchedDrivers = drivers
    .filter((d) => d.name.toLowerCase().includes(q) || d.licenseNumber.toLowerCase().includes(q))
    .slice(0, 3);

  const matchedTrips = trips
    .filter((t) => t.id.toLowerCase().includes(q) || t.source.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q))
    .slice(0, 3);

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-start justify-center pt-24 z-50 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, vehicle reg, driver name..."
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
          />
          <button 
            onClick={onClose} 
            className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 font-semibold"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {navigationItems.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Navigation Commands
              </div>
              <div className="space-y-0.5 mt-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-3 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchedVehicles.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Vehicles
              </div>
              <div className="space-y-0.5 mt-1">
                {matchedVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleNavigate("/fleet")}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{v.model} ({v.regNumber})</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {v.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedDrivers.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Drivers
              </div>
              <div className="space-y-0.5 mt-1">
                {matchedDrivers.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleNavigate("/drivers")}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{d.name} ({d.licenseNumber})</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {d.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedTrips.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Trips
              </div>
              <div className="space-y-0.5 mt-1">
                {matchedTrips.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleNavigate("/trips")}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Compass className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{t.id}: {t.source} → {t.destination}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {navigationItems.length === 0 &&
            matchedVehicles.length === 0 &&
            matchedDrivers.length === 0 &&
            matchedTrips.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                No matching results found
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center select-none">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-500" />
            TransitOps Command Palette
          </span>
          <span className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc to close</span>
          </span>
        </div>
      </div>
      
      {/* Background click to close */}
      <div className="absolute inset-0 z-[-1]" onClick={onClose} />
    </div>
  );
}