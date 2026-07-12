"use client";

import React, { useState } from "react";
import { useTransitStore, getPermission } from "@/lib/store";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function FuelExpenses() {
  const { vehicles, trips, fuelLogs, expenses, maintenanceLogs, addFuelLog, addExpense, currentUser } = useTransitStore();
  const writeAccess = currentUser ? getPermission(currentUser.role, "fuelExp") === "write" : false;

  // Fuel Modal State
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelVehicleId, setFuelVehicleId] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");

  // Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expVehicleId, setExpVehicleId] = useState("");
  const [expTripId, setExpTripId] = useState("");
  const [expType, setExpType] = useState("Tolls");
  const [expAmount, setExpAmount] = useState("");
  const [expDesc, setExpDesc] = useState("");

  // Calculations
  const totalFuelCost = fuelLogs.reduce((acc, log) => acc + log.cost, 0);
  const totalMaintenanceCost = maintenanceLogs.reduce((acc, log) => acc + log.cost, 0);
  const totalOtherExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;

  const handleAddFuelLog = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fuelVehicleId || !fuelLiters || !fuelCost) {
      toast.error("Please fill in all fields.");
      return;
    }

    addFuelLog({
      vehicleId: fuelVehicleId,
      liters: Number(fuelLiters),
      cost: Number(fuelCost),
      date: new Date().toISOString().split("T")[0]
    });

    toast.success("Fuel log added successfully.");
    setShowFuelModal(false);
    setFuelVehicleId("");
    setFuelLiters("");
    setFuelCost("");
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();

    if (!expVehicleId || !expAmount) {
      toast.error("Please select a vehicle and enter an amount.");
      return;
    }

    addExpense({
      vehicleId: expVehicleId,
      tripId: expTripId || undefined,
      type: expType,
      amount: Number(expAmount),
      description: expDesc,
      date: new Date().toISOString().split("T")[0]
    });

    toast.success("Expense logged successfully.");
    setShowExpenseModal(false);
    setExpVehicleId("");
    setExpTripId("");
    setExpAmount("");
    setExpDesc("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and top sums */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">Fuel & Expense Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Record and calculate total operational costs of vehicles.</p>
        </div>

        {writeAccess && (
          <div className="flex gap-2.5">
            <button
              onClick={() => setShowFuelModal(true)}
              className="bg-[#B26A00] hover:bg-[#8F5500] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-orange-950/10"
            >
              <Plus size={14} />
              <span>Log Fuel</span>
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="bg-[#1E3A5F] hover:bg-[#152a46] active:scale-[0.99] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-950/10"
            >
              <Plus size={14} />
              <span>Add Expense</span>
            </button>
          </div>
        )}
      </div>

      {/* Fuel Logs & Other Expenses */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* FUEL LOGS LIST */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuel Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-semibold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-2.5">Vehicle</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Liters</th>
                  <th className="px-4 py-2.5 text-right font-mono">Fuel Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {fuelLogs.map((log) => {
                  const vehicleObj = vehicles.find((v) => v.id === log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{vehicleObj ? vehicleObj.model : "—"}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{log.date}</td>
                      <td className="px-4 py-3 font-mono">{log.liters} L</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-white">₹{log.cost.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* OTHER EXPENSES LIST */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Other Expenses (Toll / Misc)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-semibold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-2.5">Trip / Vehicle</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5 text-right font-mono">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {expenses.map((exp) => {
                  const vehicleObj = vehicles.find((v) => v.id === exp.vehicleId);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 font-medium">
                        <span className="font-bold text-slate-950 dark:text-white block">{exp.tripId || "—"}</span>
                        <span className="text-[10px] text-slate-400 block">{vehicleObj ? vehicleObj.model : "—"}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-500">{exp.type}</td>
                      <td className="px-4 py-3 text-slate-400 italic">{exp.description}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 dark:text-white">₹{exp.amount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Aggregate Cost Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl flex justify-between items-center text-white relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl z-0" />
        <div className="z-10">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Calculated Operational Summary</p>
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mt-1">Total Operational Cost (Auto) = Fuel + Maint + Misc</h2>
        </div>
        <div className="text-right z-10">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aggregated Total</p>
          <span className="text-3xl font-extrabold text-amber-500 font-mono">₹{(totalOperationalCost).toLocaleString()}</span>
        </div>
      </div>

      {/* LOG FUEL MODAL */}
      {showFuelModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Log Fuel Purchase</h3>
              <button onClick={() => setShowFuelModal(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFuelLog} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Select Vehicle
                </label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
                  required
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model} ({v.regNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Liters
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 42"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Fuel Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 3150"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#B26A00] hover:bg-[#8F5500] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg"
                >
                  Log Fuel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Log Operating Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Select Vehicle
                  </label>
                  <select
                    value={expVehicleId}
                    onChange={(e) => setExpVehicleId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
                    required
                  >
                    <option value="">Vehicle...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Linked Trip (Optional)
                  </label>
                  <select
                    value={expTripId}
                    onChange={(e) => setExpTripId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
                  >
                    <option value="">None...</option>
                    {trips.slice(0, 10).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Expense Type
                  </label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
                  >
                    <option value="Tolls">Tolls</option>
                    <option value="Permit">Permits</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other Misc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description / Vendor Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Express Toll Plaza GJ"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1E3A5F] hover:bg-[#152a46] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
