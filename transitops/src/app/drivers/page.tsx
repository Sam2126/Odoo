"use client";

import React, { useState } from "react";
import { useTransitStore, DriverStatus, getPermission } from "@/lib/store";
import { Plus, Search, Users, AlertTriangle, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function Drivers() {
  const { drivers, addDriver, updateDriver, currentUser } = useTransitStore();
  const writeAccess = currentUser ? getPermission(currentUser.role, "drivers") === "write" : false;

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setLicenseCategory] = useState<"LMV" | "HMV">("LMV");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [safetyScore, setSafetyScore] = useState("100");

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !licenseNumber || !licenseExpiry || !contactNumber || !safetyScore) {
      toast.error("Please fill in all fields.");
      return;
    }

    const res = addDriver({
      name,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseCategory,
      licenseExpiry,
      contactNumber,
      safetyScore: Number(safetyScore),
      status: "Available"
    });

    if (res.success) {
      toast.success("Driver profile registered successfully!");
      setShowAddModal(false);
      // Reset form
      setName("");
      setLicenseNumber("");
      setLicenseExpiry("");
      setContactNumber("");
      setSafetyScore("100");
    } else {
      toast.error(res.error || "Failed to add driver.");
    }
  };

  const toggleStatus = (id: string, currentStatus: DriverStatus) => {
    if (!writeAccess) {
      toast.error("Access Restricted: View Only Mode.");
      return;
    }
    const statuses: DriverStatus[] = ["Available", "On Trip", "Suspended", "Off Duty"];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    updateDriver(id, { status: statuses[nextIdx] });
    toast.success(`Driver status updated to ${statuses[nextIdx]}.`);
  };

  // Filtered drivers
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || d.licenseCategory === filterCategory;
    const matchesStatus = filterStatus === "All" || d.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">Drivers & Safety Profiles</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage driving licenses, contact details, and compliance scores.</p>
        </div>
        {writeAccess && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#B26A00] hover:bg-[#8F5500] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-150 shadow-md shadow-orange-950/10"
          >
            <Plus size={14} />
            <span>Add Driver</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="LMV">LMV (Light Motor)</option>
            <option value="HMV">HMV (Heavy Motor)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver or license no..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3.5">Driver</th>
                <th className="px-6 py-3.5">License No</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Expiry</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5 text-center">Safety Score</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No drivers found matching the filters
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => {
                  const isExpired = d.licenseExpiry.toUpperCase().includes("EXPIRED");
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-500">
                          {d.name.split(" ").map(n=>n[0]).join("")}
                        </div>
                        <span>{d.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono uppercase">{d.licenseNumber}</td>
                      <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">{d.licenseCategory}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 font-semibold ${isExpired ? "text-red-500" : ""}`}>
                          {d.licenseExpiry}
                          {isExpired && <ShieldAlert size={12} className="shrink-0 text-red-500 animate-pulse" />}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400">{d.contactNumber}</td>
                      <td className="px-6 py-4 text-center font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${d.safetyScore >= 90 ? "bg-emerald-500" : d.safetyScore >= 80 ? "bg-blue-500" : "bg-amber-500"}`} 
                              style={{ width: `${d.safetyScore}%` }}
                            />
                          </div>
                          <span>{d.safetyScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => writeAccess && toggleStatus(d.id, d.status)}
                          disabled={!writeAccess}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors inline-block w-24 ${
                            writeAccess ? "cursor-pointer hover:opacity-85" : "cursor-default opacity-85"
                          } ${
                            d.status === "Available"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : d.status === "On Trip"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : d.status === "Suspended"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                          }`}
                        >
                          {d.status}
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

      {/* Rules Notice */}
      <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-4 py-2.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Rule: Expired license or Suspended status → blocked from trip assignment</span>
      </div>

      {/* ADD DRIVER DIALOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Register New Driver</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DL-88213"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    License Category
                  </label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                  >
                    <option value="LMV">LMV (Light)</option>
                    <option value="HMV">HMV (Heavy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    License Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12/2028 or 05/2025 EXPIRED"
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Initial Safety Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#B26A00] hover:bg-[#8F5500] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-orange-950/20"
                >
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
