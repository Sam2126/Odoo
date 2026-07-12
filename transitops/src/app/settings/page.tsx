"use client";

import React, { useState } from "react";
import { useTransitStore } from "@/lib/store";
import { Settings as SettingsIcon, Shield, Save } from "lucide-react";
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

  // RBAC Permission Grid Matrix
  const rbacMatrix: Array<{ role: string; fleet: string; drivers: string; trips: string; fuelExp: string; analytics: string }> = [
    { role: "Fleet Manager", fleet: "✓ Write", drivers: "✓ Write", trips: "— No Access", fuelExp: "— No Access", analytics: "✓ Write" },
    { role: "Driver", fleet: "View Only", drivers: "— No Access", trips: "✓ Write", fuelExp: "— No Access", analytics: "— No Access" },
    { role: "Safety Officer", fleet: "— No Access", drivers: "✓ Write", trips: "View Only", fuelExp: "— No Access", analytics: "— No Access" },
    { role: "Financial Analyst", fleet: "View Only", drivers: "— No Access", trips: "— No Access", fuelExp: "✓ Write", analytics: "✓ Write" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-200">
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

      {/* Column 2: Role-Based Access Control (RBAC) */}
      <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Role-Based Access Control (RBAC)</h2>
            <p className="text-[10px] text-slate-400">Permissions matrix enforcing module visibility scopes.</p>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Fleet</th>
                <th className="px-6 py-3.5">Drivers</th>
                <th className="px-6 py-3.5">Trips</th>
                <th className="px-6 py-3.5">Fuel/Exp.</th>
                <th className="px-6 py-3.5">Analytics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {rbacMatrix.map((matrix, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{matrix.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${matrix.fleet.includes("✓") ? "bg-emerald-500/10 text-emerald-600" : matrix.fleet.includes("View") ? "bg-blue-500/10 text-blue-600" : "text-slate-400"}`}>
                      {matrix.fleet}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${matrix.drivers.includes("✓") ? "bg-emerald-500/10 text-emerald-600" : matrix.drivers.includes("View") ? "bg-blue-500/10 text-blue-600" : "text-slate-400"}`}>
                      {matrix.drivers}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${matrix.trips.includes("✓") ? "bg-emerald-500/10 text-emerald-600" : matrix.trips.includes("View") ? "bg-blue-500/10 text-blue-600" : "text-slate-400"}`}>
                      {matrix.trips}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${matrix.fuelExp.includes("✓") ? "bg-emerald-500/10 text-emerald-600" : matrix.fuelExp.includes("View") ? "bg-blue-500/10 text-blue-600" : "text-slate-400"}`}>
                      {matrix.fuelExp}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${matrix.analytics.includes("✓") ? "bg-emerald-500/10 text-emerald-600" : matrix.analytics.includes("View") ? "bg-blue-500/10 text-blue-600" : "text-slate-400"}`}>
                      {matrix.analytics}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
