"use client";

import React, { useState } from "react";
import { useTransitStore, MaintenanceLog, getPermission } from "@/lib/store";
import { Wrench, ArrowRight, X, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Maintenance() {
  const { vehicles, maintenanceLogs, addMaintenanceLog, closeMaintenanceLog, currentUser } = useTransitStore();
  const writeAccess = currentUser ? getPermission(currentUser.role, "maintenance") === "write" : false;

  // Log Service Record Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<"Active" | "Closed">("Active");

  const handleLogService = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicleId || !description || !cost || !date) {
      toast.error("Please fill in all fields.");
      return;
    }

    addMaintenanceLog({
      vehicleId: selectedVehicleId,
      description,
      cost: Number(cost),
      date,
      status
    });

    toast.success("Maintenance log service record created!");
    
    // Reset Form
    setSelectedVehicleId("");
    setDescription("");
    setCost("");
    setStatus("Active");
  };

  const handleToggleStatus = (logId: string, currentStatus: "Active" | "Closed") => {
    if (currentStatus === "Active") {
      closeMaintenanceLog(logId);
      toast.success("Maintenance record completed. Vehicle status restored to Available.");
    } else {
      toast.info("Completed maintenance records cannot be reopened.");
    }
  };

  return (
    <div className={`grid grid-cols-1 ${writeAccess ? "xl:grid-cols-3" : "xl:grid-cols-1"} gap-8 animate-in fade-in duration-200`}>
      {/* Column 1: Log Service Record Form */}
      {writeAccess && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs h-fit space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Log Service Record</h2>
          </div>
          <p className="text-[10px] text-slate-400">Put vehicles into service shops and schedule inspections.</p>
        </div>

        <form onSubmit={handleLogService} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select Vehicle
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
              required
            >
              <option value="">Choose vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.model} ({v.regNumber}) - {v.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Service Type / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Oil Change"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                placeholder="2500"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Initial Record Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
            >
              <option value="Active">Active (In Shop)</option>
              <option value="Closed">Closed (Completed)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#B26A00] hover:bg-[#8F5500] active:scale-[0.99] text-white rounded-lg py-2.5 text-xs font-semibold shadow-md transition-all mt-2"
          >
            Save Service Record
          </button>
        </form>

        {/* Transition Rules Diagram */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 space-y-2 select-none">
          <p className="font-semibold uppercase tracking-wider text-slate-400">Transition Workflow</p>
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-500 font-bold">Available</span>
              <ArrowRight size={10} className="text-slate-400" />
              <span className="text-slate-400 text-[9px]">creating active record</span>
              <ArrowRight size={10} className="text-slate-400" />
              <span className="text-amber-500 font-bold">In Shop</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-500 font-bold">In Shop</span>
              <ArrowRight size={10} className="text-slate-400" />
              <span className="text-slate-400 text-[9px]">closing record (not retired)</span>
              <ArrowRight size={10} className="text-slate-400" />
              <span className="text-emerald-500 font-bold">Available</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 italic">Note: In Shop vehicles are removed from the dispatch pool.</p>
        </div>
      </div>
    )}

      {/* Column 2: Service Log List */}
      <div className={`${writeAccess ? "xl:col-span-2" : "xl:col-span-1"} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col`}>
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Service Log</h2>
          <p className="text-[10px] text-slate-400">Archived service history and active maintenance shops.</p>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3.5">Vehicle</th>
                <th className="px-6 py-3.5">Service</th>
                <th className="px-6 py-3.5">Cost</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {maintenanceLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No service logs registered
                  </td>
                </tr>
              ) : (
                maintenanceLogs.map((log) => {
                  const vehicleObj = vehicles.find((v) => v.id === log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {vehicleObj ? vehicleObj.model : "Unknown"}
                      </td>
                      <td className="px-6 py-4 font-medium">{log.description}</td>
                      <td className="px-6 py-4 font-mono font-semibold">₹{log.cost.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{log.date}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => writeAccess && handleToggleStatus(log.id, log.status)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors inline-block w-24 ${
                            writeAccess && log.status === "Active" ? "cursor-pointer hover:opacity-85" : "cursor-default opacity-85"
                          } ${
                            log.status === "Active"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          }`}
                          disabled={!writeAccess || log.status === "Closed"}
                        >
                          {log.status === "Active" ? "In Shop" : "Completed"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
