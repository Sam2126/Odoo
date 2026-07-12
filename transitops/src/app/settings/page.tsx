"use client";

import React, { useState } from "react";
import { useTransitStore } from "@/lib/store";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateSettings, currentUser } = useTransitStore();
  const writeAccess = currentUser?.role === "FLEET_MANAGER";

  // Local Form state
  const [depotName, setDepotName] = useState(settings.depotName);
  const [currency, setCurrency] = useState(settings.currency);
  const [distanceUnit, setDistanceUnit] = useState(settings.distanceUnit);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeAccess) {
      toast.error("Access Restricted: Fleet Manager role required.");
      return;
    }
    updateSettings({
      depotName,
      currency,
      distanceUnit
    });
    toast.success("General settings updated successfully.");
  };

  return (
    <div className="max-w-xl mx-auto w-full animate-in fade-in duration-200">
      {/* Column 1: General settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs h-fit space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">General Configurations</h2>
          </div>
          <p className="text-[10px] text-slate-400">Configure global parameters and localization preferences.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Depot Name
            </label>
            <input
              type="text"
              value={depotName}
              onChange={(e) => setDepotName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none disabled:opacity-60"
              required
              disabled={!writeAccess}
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Currency Unit
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none disabled:opacity-60"
              disabled={!writeAccess}
            >
              <option value="INR (Rs)">INR (Rs. - ₹)</option>
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Distance Metrics
            </label>
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none disabled:opacity-60"
              disabled={!writeAccess}
            >
              <option value="Kilometers">Kilometers (km)</option>
              <option value="Miles">Miles (mi)</option>
            </select>
          </div>

          {writeAccess ? (
            <button
              type="submit"
              className="w-full bg-[#B26A00] hover:bg-[#8F5500] active:scale-[0.99] text-white rounded-lg py-2.5 text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <Save size={14} />
              Save Changes
            </button>
          ) : (
            <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg py-2.5 text-[10px] font-bold uppercase tracking-wider text-center border border-dashed border-slate-200 dark:border-slate-700">
              Only Fleet Managers can edit configs
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
