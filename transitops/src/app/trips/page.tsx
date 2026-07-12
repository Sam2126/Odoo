"use client";

import React, { useState } from "react";
import { useTransitStore, TripStatus, getPermission } from "@/lib/store";
import { Compass, AlertTriangle, ShieldCheck, X, Check, Play, Ban, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function Trips() {
  const { vehicles, drivers, trips, addTrip, dispatchTrip, completeTrip, cancelTrip, currentUser } = useTransitStore();
  const writeAccess = currentUser ? getPermission(currentUser.role, "trips") === "write" : false;

  // Create Form State
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [distance, setDistance] = useState("");
  const [revenue, setRevenue] = useState("");

  // Complete Trip Dialog Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeTripId, setCompleteTripId] = useState("");
  const [finalOdometer, setFinalOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");

  // Available vehicles list (Must not be In Shop, Retired, or On Trip)
  const availableVehicles = vehicles.filter(
    (v) => v.status === "Available"
  );

  // Available drivers list (Must not be Suspended, Off Duty, or On Trip, and license must not be expired)
  const availableDrivers = drivers.filter(
    (d) => d.status === "Available" && !d.licenseExpiry.toUpperCase().includes("EXPIRED")
  );

  // Live selected vehicle and capacity calculation
  const selectedVehicleObj = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedDriverObj = drivers.find((d) => d.id === selectedDriverId);

  const capacityLimit = selectedVehicleObj ? selectedVehicleObj.capacity : 0;
  const isOverweight = Number(cargoWeight) > capacityLimit;
  const overweightDiff = Number(cargoWeight) - capacityLimit;

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();

    if (!source || !destination || !selectedVehicleId || !selectedDriverId || !cargoWeight || !distance || !revenue) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (isOverweight) {
      toast.error("Dispatch blocked: cargo weight exceeds vehicle capacity.");
      return;
    }

    const res = addTrip({
      source,
      destination,
      distance: Number(distance),
      cargoWeight: Number(cargoWeight),
      revenue: Number(revenue),
      vehicleId: selectedVehicleId,
      driverId: selectedDriverId
    });

    if (res.success) {
      toast.success("Trip draft created! Auto-dispatched...");
      // Auto dispatch the draft trip
      const newTrip = useTransitStore.getState().trips[0];
      const dispRes = dispatchTrip(newTrip.id);
      
      if (dispRes.success) {
        toast.success(`Trip ${newTrip.id} dispatched successfully!`);
      } else {
        toast.error(dispRes.error || "Failed to dispatch trip.");
      }

      // Reset form
      setSource("");
      setDestination("");
      setSelectedVehicleId("");
      setSelectedDriverId("");
      setCargoWeight("");
      setDistance("");
      setRevenue("");
    } else {
      toast.error(res.error || "Failed to create trip.");
    }
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalOdometer || !fuelConsumed) {
      toast.error("Please fill in all fields.");
      return;
    }

    const res = completeTrip(completeTripId, Number(finalOdometer), Number(fuelConsumed));
    if (res.success) {
      toast.success("Trip completed! Metrics updated.");
      setShowCompleteModal(false);
      setFinalOdometer("");
      setFuelConsumed("");
    } else {
      toast.error(res.error || "Failed to complete trip.");
    }
  };

  return (
    <div className={`grid grid-cols-1 ${writeAccess ? "xl:grid-cols-3" : "xl:grid-cols-1"} gap-8 animate-in fade-in duration-200`}>
      {/* Column 1: Create Dispatcher Form */}
      {writeAccess && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs h-fit space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Create & Dispatch Trip</h2>
          </div>
          <p className="text-[10px] text-slate-400">Initialize a new trip and validate operational rules.</p>
        </div>

        {/* Dispatch Progress Tracker */}
        <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 select-none">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Draft</span>
          <ChevronRight size={10} />
          <span className="flex items-center gap-1 text-blue-600"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> Dispatched</span>
          <ChevronRight size={10} />
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Completed</span>
          <ChevronRight size={10} />
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Cancelled</span>
        </div>

        <form onSubmit={handleCreateTrip} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Source
              </label>
              <input
                type="text"
                placeholder="e.g. Gandhinagar Depot"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Ahmedabad Hub"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Vehicle (Available Only)
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
              required
            >
              <option value="">Select an available vehicle...</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.model} ({v.regNumber}) - {v.capacity} kg max
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Driver (Available Only)
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
              required
            >
              <option value="">Select an available driver...</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.licenseCategory}) - Rating: {d.safetyScore}%
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Cargo Weight (kg)
              </label>
              <input
                type="number"
                placeholder="450"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                placeholder="38"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Revenue (₹)
              </label>
              <input
                type="number"
                placeholder="15000"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* CAPACITY WARNING BOX */}
          {selectedVehicleId && cargoWeight && isOverweight && (
            <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3 text-[11px] text-red-400 flex flex-col gap-1 animate-in shake-in duration-150">
              <div className="flex items-center gap-1.5 text-red-500 font-bold uppercase">
                <AlertTriangle size={14} />
                <span>Dispatch Blocked</span>
              </div>
              <p>Vehicle Capacity: <b>{capacityLimit} kg</b> | Cargo Weight: <b>{cargoWeight} kg</b></p>
              <p className="text-[10px] text-red-500/80">X Capacity exceeded by {overweightDiff} kg - dispatch blocked.</p>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setSource("");
                setDestination("");
                setSelectedVehicleId("");
                setSelectedDriverId("");
                setCargoWeight("");
                setDistance("");
                setRevenue("");
              }}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-500"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isOverweight || !selectedVehicleId || !selectedDriverId}
              className={`flex-1 text-white rounded-lg py-2.5 text-xs font-semibold shadow-md transition-all duration-150 ${
                isOverweight || !selectedVehicleId || !selectedDriverId
                  ? "bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-[#B26A00] hover:bg-[#8F5500] active:scale-[0.99]"
              }`}
            >
              Dispatch Trip
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Column 2: Live Board of Trips */}
      <div className={`${writeAccess ? "xl:col-span-2" : "xl:col-span-1"} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col`}>
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Live Board</h2>
          <p className="text-[10px] text-slate-400">Tracking progress and operator status transitions.</p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[600px] flex-1">
          {trips.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
              No trips registered on the board
            </div>
          ) : (
            trips.map((t) => {
              const vehicleObj = vehicles.find((v) => v.id === t.vehicleId);
              const driverObj = drivers.find((d) => d.id === t.driverId);
              return (
                <div
                  key={t.id}
                  className="px-6 py-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{t.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block border ${
                          t.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : t.status === "Dispatched"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            : t.status === "Cancelled"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-0.5 font-medium text-slate-600 dark:text-slate-300">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {t.source} → {t.destination}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span>Assigned: <b>{vehicleObj ? vehicleObj.model : "Unassigned"}</b> / <b>{driverObj ? driverObj.name : "Unassigned"}</b></span>
                        <span>•</span>
                        <span>Distance: <b>{t.distance} km</b></span>
                        <span>•</span>
                        <span>Weight: <b>{t.cargoWeight} kg</b></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4.5 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">ETA / State</p>
                      <p className="font-mono text-slate-700 dark:text-slate-200 mt-0.5">{t.eta || "—"}</p>
                    </div>

                    {/* Operational triggers */}
                    {writeAccess && (
                      <div className="flex gap-2">
                        {t.status === "Dispatched" && (
                          <>
                            <button
                              onClick={() => {
                                setCompleteTripId(t.id);
                                // Auto calculate a realistic final odometer (current odometer + distance)
                                if (vehicleObj) {
                                  setFinalOdometer(String(vehicleObj.odometer + t.distance));
                                }
                                setFuelConsumed("5"); // Seed suggestion
                                setShowCompleteModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Check size={12} />
                              Complete
                            </button>
                            <button
                              onClick={() => {
                                cancelTrip(t.id);
                                toast.warning(`Trip ${t.id} cancelled. Vehicle & driver released.`);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all"
                            >
                              <Ban size={12} />
                              Cancel
                            </button>
                          </>
                        )}
                        {t.status === "Draft" && (
                          <button
                            onClick={() => {
                              const res = dispatchTrip(t.id);
                              if (res.success) {
                                toast.success(`Trip ${t.id} dispatched!`);
                              } else {
                                toast.error(res.error || "Dispatch failed.");
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Play size={12} fill="currentColor" />
                            Dispatch
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/40 px-6 py-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
          On Complete: updates vehicle odometer → records fuel logs → calculates expenses → releases operators back to Available.
        </div>
      </div>

      {/* COMPLETE TRIP MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Complete Trip {completeTripId}</h3>
              <button onClick={() => setShowCompleteModal(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Final Odometer Reading (km)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 74038"
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Fuel Consumed (Liters)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-950/20"
                >
                  Submit Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}