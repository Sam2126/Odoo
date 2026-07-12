"use client";

import React, { useState } from "react";
import { useTransitStore, VehicleStatus, getPermission } from "@/lib/store";
import { Plus, Search, Truck, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

export default function Fleet() {
  const { vehicles, addVehicle, updateVehicle, currentUser } = useTransitStore();
  const writeAccess = currentUser ? getPermission(currentUser.role, "fleet") === "write" : false;
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [regNumber, setRegNumber] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<"Van" | "Truck" | "Mini">("Van");
  const [capacity, setCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regNumber || !model || !capacity || !odometer || !acquisitionCost) {
      toast.error("Please fill in all fields.");
      return;
    }

    const res = addVehicle({
      regNumber: regNumber.toUpperCase().replace(/\s+/g, ""),
      model,
      type,
      capacity: Number(capacity),
      odometer: Number(odometer),
      acquisitionCost: Number(acquisitionCost),
      status: "Available"
    });

    if (res.success) {
      toast.success("Vehicle registered successfully!");
      setShowAddModal(false);
      // Reset form
      setRegNumber("");
      setModel("");
      setCapacity("");
      setOdometer("");
      setAcquisitionCost("");
    } else {
      toast.error(res.error || "Failed to add vehicle.");
    }
  };

  const toggleStatus = (id: string, currentStatus: VehicleStatus) => {
    if (!writeAccess) {
      toast.error("Access Restricted: View Only Mode.");
      return;
    }
    const statuses: VehicleStatus[] = ["Available", "On Trip", "In Shop", "Retired"];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    updateVehicle(id, { status: statuses[nextIdx] });
    toast.success(`Vehicle status updated to ${statuses[nextIdx]}.`);
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || v.type === filterType;
    const matchesStatus = filterStatus === "All" || v.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">Vehicle Registry</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Master database of all logistics transport vehicles.</p>
        </div>
        {writeAccess && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#B26A00] hover:bg-[#8F5500] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-150 shadow-md shadow-orange-950/10"
          >
            <Plus size={14} />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Truck">Trucks</option>
            <option value="Van">Vans</option>
            <option value="Mini">Minis</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reg. no. or model..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table Registry */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3.5">Reg. No. (Unique)</th>
                <th className="px-6 py-3.5">Name/Model</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Capacity</th>
                <th className="px-6 py-3.5">Odometer</th>
                <th className="px-6 py-3.5">Acq. Cost</th>
                <th className="px-6 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No vehicles found matching the filters
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white uppercase">{v.regNumber}</td>
                    <td className="px-6 py-4 font-semibold">{v.model}</td>
                    <td className="px-6 py-4">{v.type}</td>
                    <td className="px-6 py-4">{v.capacity >= 1000 ? `${v.capacity / 1000} Ton` : `${v.capacity} kg`}</td>
                    <td className="px-6 py-4 font-mono">{v.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4 font-mono">₹{v.acquisitionCost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => writeAccess && toggleStatus(v.id, v.status)}
                        disabled={!writeAccess}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-colors inline-block w-24 ${
                          writeAccess ? "cursor-pointer hover:opacity-85" : "cursor-default opacity-85"
                        } ${
                          v.status === "Available"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : v.status === "On Trip"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            : v.status === "In Shop"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        }`}
                      >
                        {v.status}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-4 py-2.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher</span>
      </div>

      {/* ADD VEHICLE DIALOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Register New Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Registration Number (Unique)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GJ01AB4521"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white uppercase placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Vehicle Name / Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. VAN-05 or TRUCK-12"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Max Capacity (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 500 or 5000"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Odometer (km)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 74000"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Acquisition Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 620000"
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(e.target.value)}
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
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}