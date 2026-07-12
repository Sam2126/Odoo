"use client";

import React from "react";
import { useTransitStore } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, Download, Sparkles, Printer } from "lucide-react";
import { toast } from "sonner";

export default function Analytics() {
  const { vehicles, trips, fuelLogs, expenses, maintenanceLogs } = useTransitStore();

  // Calculations
  const totalDistance = trips.filter(t => t.status === "Completed").reduce((acc, t) => acc + t.distance, 0);
  const totalFuelLiters = fuelLogs.reduce((acc, l) => acc + l.liters, 0);
  
  const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(1) : "0.0";
  
  // Utilization
  const availableVehicles = vehicles.filter(v => v.status === "Available").length;
  const onTripVehicles = vehicles.filter(v => v.status === "On Trip").length;
  const utilizationPool = availableVehicles + onTripVehicles;
  const fleetUtilization = utilizationPool > 0 ? Math.round((onTripVehicles / utilizationPool) * 100) : 0;

  // Operational Cost
  const totalFuelCost = fuelLogs.reduce((acc, log) => acc + log.cost, 0);
  const totalMaintenanceCost = maintenanceLogs.reduce((acc, log) => acc + log.cost, 0);
  const totalOtherExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;

  // Vehicle ROI: (Total Revenue - (Maintenance + Fuel + Other)) / Total Acquisition Cost of active vehicles
  const totalRevenue = trips.filter(t => t.status === "Completed").reduce((acc, t) => acc + t.revenue, 0);
  const totalAcquisitionCost = vehicles.filter(v => v.status !== "Retired").reduce((acc, v) => acc + v.acquisitionCost, 0);
  
  const fleetROI = totalAcquisitionCost > 0 
    ? ((totalRevenue - totalOperationalCost) / totalAcquisitionCost * 100).toFixed(1) 
    : "0.0";

  // CSV Export Trigger
  const handleExportCSV = () => {
    const headers = "TripID,Source,Destination,Distance,CargoWeight,Revenue,Status,Date\n";
    const rows = trips
      .map(
        (t) =>
          `${t.id},"${t.source}","${t.destination}",${t.distance},${t.cargoWeight},${t.revenue},${t.status},${t.date}`
      )
      .join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `transitops_trips_export.csv`);
    a.click();
    toast.success("CSV export downloaded successfully!");
  };

  // Recharts Data: Monthly Revenue (Jan - Jul 2026)
  const monthlyRevenueData = [
    { month: "Jan", revenue: 420000 },
    { month: "Feb", revenue: 510000 },
    { month: "Mar", revenue: 490000 },
    { month: "Apr", revenue: 580000 },
    { month: "May", revenue: 610000 },
    { month: "Jun", revenue: 680000 },
    { month: "Jul", revenue: totalRevenue > 0 ? totalRevenue : 320000 } // fallback
  ];

  // Recharts Data: Top Costliest Vehicles
  const vehicleCosts = vehicles.map(v => {
    const vFuel = fuelLogs.filter(l => l.vehicleId === v.id).reduce((acc, l) => acc + l.cost, 0);
    const vMaint = maintenanceLogs.filter(l => l.vehicleId === v.id).reduce((acc, l) => acc + l.cost, 0);
    const vExp = expenses.filter(l => l.vehicleId === v.id).reduce((acc, l) => acc + l.amount, 0);
    return {
      model: v.model,
      regNumber: v.regNumber,
      totalCost: vFuel + vMaint + vExp
    };
  })
  .sort((a, b) => b.totalCost - a.totalCost)
  .slice(0, 3); // top 3 costliest

  const colors = ["#EF4444", "#F59E0B", "#3B82F6"]; // red, orange, blue

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Financial summaries, asset metrics, and operational calculations.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handleExportCSV}
            className="bg-[#1E3A5F] hover:bg-[#152a46] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-[#B26A00] hover:bg-[#8F5500] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Printer size={14} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Fuel Efficiency", value: `${fuelEfficiency} km/l`, border: "border-l-blue-500" },
          { label: "Fleet Utilization", value: `${fleetUtilization}%`, border: "border-l-emerald-500" },
          { label: "Operational Cost", value: `₹${totalOperationalCost.toLocaleString()}`, border: "border-l-amber-500" },
          { label: "Vehicle ROI", value: `${fleetROI}%`, border: "border-l-emerald-500" },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`bg-white dark:bg-slate-900 border-y border-r border-l-4 border-slate-200 dark:border-slate-800 ${card.border} rounded-xl p-6 shadow-xs flex flex-col justify-between h-28 transition-all hover:-translate-y-0.5`}
          >
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {card.label}
            </span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {card.value}
            </span>
          </div>
        ))}
      </div>

      {/* ROI Formula Notice */}
      <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-4 py-2.5 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Formula: ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost</span>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <Calendar size={14} />
              <span>FY 2026</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`₹${value?.toLocaleString() || 0}`, "Revenue"]}
                  contentStyle={{ background: "#0F172A", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Costliest Vehicles Horizontal Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Top Costliest Vehicles</h3>
            <div className="space-y-5">
              {vehicleCosts.map((vc, idx) => {
                const maxCost = Math.max(...vehicleCosts.map(c => c.totalCost), 1);
                const percent = Math.round((vc.totalCost / maxCost) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{vc.model} <span className="text-[10px] text-slate-400 font-normal">({vc.regNumber})</span></span>
                      <span className="text-slate-950 dark:text-white font-mono">₹{vc.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: colors[idx % colors.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {vehicleCosts.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No operational costs logged yet.
                </div>
              )}
            </div>
          </div>
          
          <div className="text-[10px] text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 leading-normal">
            Chart tracks cumulative costs including logged fuels, scheduled maintenance service records, and miscellaneous expenses.
          </div>
        </div>
      </div>
    </div>
  );
}
