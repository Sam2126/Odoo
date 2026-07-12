"use client";

import React, { useState } from "react";
import { useTransitStore } from "@/lib/store";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  Shield,
  Gauge,
  CircleDollarSign,
  Fuel,
  Wrench,
  Activity,
  Award
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { vehicles, drivers, trips, maintenanceLogs, fuelLogs, expenses, activities } = useTransitStore();
  
  // Dashboard Category Filters
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRegion, setFilterRegion] = useState("All");

  // Helper to dynamically assign regions to vehicles for the demo metrics
  const getVehicleRegion = (vehicleId: string) => {
    const idx = parseInt(vehicleId.replace(/\D/g, "")) || 0;
    const regions = ["West", "North", "South"];
    return regions[idx % regions.length];
  };

  // Helper to dynamically assign regions to drivers for compliance metrics
  const getDriverRegion = (driverId: string) => {
    const idx = parseInt(driverId.replace(/\D/g, "")) || 0;
    const regions = ["West", "North", "South"];
    return regions[idx % regions.length];
  };

  // --- Filtering Logic ---
  // Filter vehicles first
  const filteredVehicles = vehicles.filter((v) => {
    const matchesType = filterType === "All" || v.type === filterType;
    const matchesStatus = filterStatus === "All" || v.status === filterStatus;
    const matchesRegion = filterRegion === "All" || getVehicleRegion(v.id) === filterRegion;
    return matchesType && matchesStatus && matchesRegion;
  });

  const filteredVehicleIds = new Set(filteredVehicles.map((v) => v.id));

  // Filter trips belonging to the active vehicles
  const filteredTrips = trips.filter((t) => filteredVehicleIds.has(t.vehicleId));

  // Filter drivers belonging to the active region
  const filteredDrivers = drivers.filter((d) => {
    return filterRegion === "All" || getDriverRegion(d.id) === filterRegion;
  });

  // --- Dynamic calculations based on filters ---
  const totalVehiclesCount = filteredVehicles.length;
  const activeVehicles = filteredVehicles.filter(v => v.status !== "Retired").length;
  const availableVehicles = filteredVehicles.filter(v => v.status === "Available").length;
  const inMaintenance = filteredVehicles.filter(v => v.status === "In Shop").length;
  const activeTripsCount = filteredTrips.filter(t => t.status === "Dispatched").length;
  const pendingTripsCount = filteredTrips.filter(t => t.status === "Draft").length;
  const driversOnDuty = filteredDrivers.filter(d => d.status === "On Trip" || d.status === "Available").length;
  
  // Utilization: On Trip Vehicles / (Available + On Trip Vehicles)
  const onTripVehicles = filteredVehicles.filter(v => v.status === "On Trip").length;
  const utilizationPool = availableVehicles + onTripVehicles;
  const fleetUtilization = utilizationPool > 0 ? Math.round((onTripVehicles / utilizationPool) * 100) : 0;

  // Recent trips list
  const recentTrips = filteredTrips.slice(0, 4);

  // Status counts for chart
  const statusCounts = {
    Available: filteredVehicles.filter(v => v.status === "Available").length,
    OnTrip: filteredVehicles.filter(v => v.status === "On Trip").length,
    InShop: filteredVehicles.filter(v => v.status === "In Shop").length,
    Retired: filteredVehicles.filter(v => v.status === "Retired").length,
  };

  const statusPercentages = {
    Available: totalVehiclesCount > 0 ? Math.round((statusCounts.Available / totalVehiclesCount) * 100) : 0,
    OnTrip: totalVehiclesCount > 0 ? Math.round((statusCounts.OnTrip / totalVehiclesCount) * 100) : 0,
    InShop: totalVehiclesCount > 0 ? Math.round((statusCounts.InShop / totalVehiclesCount) * 100) : 0,
    Retired: totalVehiclesCount > 0 ? Math.round((statusCounts.Retired / totalVehiclesCount) * 100) : 0,
  };

  // --- Financial Operations Calculations based on filters ---
  const totalRevenue = filteredTrips.filter(t => t.status === "Completed").reduce((acc, t) => acc + t.revenue, 0);
  const fuelCost = fuelLogs.filter(log => filteredVehicleIds.has(log.vehicleId)).reduce((acc, log) => acc + log.cost, 0);
  const maintenanceCost = maintenanceLogs.filter(log => filteredVehicleIds.has(log.vehicleId)).reduce((acc, log) => acc + log.cost, 0);
  const otherExpenses = expenses.filter(exp => filteredVehicleIds.has(exp.vehicleId)).reduce((acc, exp) => acc + exp.amount, 0);
  const totalOperationalCost = fuelCost + maintenanceCost + otherExpenses;
  const profit = totalRevenue - totalOperationalCost;

  // --- Lists & Alerts based on filters ---
  const upcomingMaintenance = maintenanceLogs
    .filter(log => log.status === "Active" && filteredVehicleIds.has(log.vehicleId))
    .slice(0, 3);
  const licenseExpiryAlerts = filteredDrivers.filter(d => d.licenseExpiry.toUpperCase().includes("EXPIRED")).slice(0, 3);
  const topDrivers = [...filteredDrivers].sort((a, b) => b.safetyScore - a.safetyScore).slice(0, 3);

  // Dynamic recent activities based on filtered set
  const recentActivities = (activities || []).filter(act => {
    if (filterRegion === "All" && filterType === "All" && filterStatus === "All") return true;
    const mentionsAnyFilteredVehicle = filteredVehicles.some(v => 
      act.text.includes(v.model) || act.text.includes(v.regNumber)
    );
    const mentionsAnyFilteredTrip = filteredTrips.some(t => 
      act.text.includes(t.id)
    );
    if (act.type === "system") return true;
    return mentionsAnyFilteredVehicle || mentionsAnyFilteredTrip;
  }).slice(0, 5);

  const aiInsights = [
    {
      id: 1,
      type: "warning",
      message: "Vehicle TRK-08 requires maintenance in 2 days.",
      actionText: "Schedule Maintenance",
      link: "/maintenance"
    },
    {
      id: 2,
      type: "success",
      message: "Driver Rahul has maintained an excellent 96 Safety Score.",
      actionText: "View Driver Leaderboard",
      link: "/drivers"
    },
    {
      id: 3,
      type: "danger",
      message: "Fuel consumption increased by 18% this week on Gujarat Highway route.",
      actionText: "Analyze Fuel Logs",
      link: "/fuel-expenses"
    },
    {
      id: 4,
      type: "info",
      message: "Vehicle VAN-04 has low utilization (idle for 4 days).",
      actionText: "Assign to Pending Trip",
      link: "/trips"
    },
    {
      id: 5,
      type: "success",
      message: "Switching route to Vehicle TRK-12 could reduce fuel cost by 11%.",
      actionText: "Optimize Route",
      link: "/trips"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Fleet Command Centre</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time status analysis of vehicles, trips, and operators.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Vehicle Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Mini">Mini</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Region
            </label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Regions</option>
              <option value="West">West India</option>
              <option value="North">North India</option>
              <option value="South">South India</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 1: Operational Metrics */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Operational status summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {[
            { label: "Active Vehicles", value: activeVehicles, border: "border-l-blue-500" },
            { label: "Available Vehicles", value: availableVehicles, border: "border-l-emerald-500" },
            { label: "In Maintenance", value: inMaintenance, border: "border-l-amber-500" },
            { label: "Active Trips", value: activeTripsCount, border: "border-l-blue-500" },
            { label: "Pending Trips", value: pendingTripsCount, border: "border-l-cyan-400" },
            { label: "Drivers On Duty", value: driversOnDuty, border: "border-l-blue-600" },
            { label: "Fleet Utilization", value: `${fleetUtilization}%`, border: "border-l-emerald-500" },
          ].map((card, idx) => (
            <div
              key={idx}
              className={`bg-white dark:bg-slate-900 border-y border-r border-l-4 border-slate-200 dark:border-slate-800 ${card.border} rounded-xl p-4 shadow-xs flex flex-col justify-between h-24 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                {card.label}
              </span>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                {card.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards Row 2: Financial Overview */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Financial operations (₹ INR)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, border: "border-l-emerald-500", icon: CircleDollarSign },
            { label: "Operational Cost", value: `₹${totalOperationalCost.toLocaleString()}`, border: "border-l-blue-500", icon: TrendingUp },
            { label: "Fuel Expenses", value: `₹${fuelCost.toLocaleString()}`, border: "border-l-amber-500", icon: Fuel },
            { label: "Maintenance Cost", value: `₹${maintenanceCost.toLocaleString()}`, border: "border-l-red-500", icon: Wrench },
            { label: "Net Profit", value: `₹${profit.toLocaleString()}`, border: profit >= 0 ? "border-l-emerald-500" : "border-l-red-500", icon: CircleDollarSign },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`bg-white dark:bg-slate-900 border-y border-r border-l-4 border-slate-200 dark:border-slate-800 ${card.border} rounded-xl p-4.5 shadow-xs flex items-center justify-between h-24 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex flex-col justify-between h-full">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
                    {card.label}
                  </span>
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-mono leading-none">
                    {card.value}
                  </span>
                </div>
                <Icon className="w-5 h-5 text-slate-300 dark:text-slate-700" />
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-slate-900 dark:bg-slate-900/60 rounded-2xl border border-slate-800 p-6 relative overflow-hidden select-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl" />

        <div className="flex items-center gap-2.5 mb-4">
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          <h2 className="text-sm font-bold text-white tracking-wide">TransitOps Smart AI Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {aiInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-36 transition-all duration-150 hover:bg-slate-800/60 hover:-translate-y-0.5"
            >
              <div className="space-y-1.5">
                <span
                  className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                    insight.type === "warning"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : insight.type === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : insight.type === "danger"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {insight.type}
                </span>
                <p className="text-[10px] text-slate-300 font-medium leading-relaxed line-clamp-3">
                  {insight.message}
                </p>
              </div>
              <Link
                href={insight.link}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 group mt-2 self-start"
              >
                <span>{insight.actionText}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Trips & Vehicle status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trips Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Recent Trips</h2>
            <Link href="/trips" className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
              <span>View dispatcher board</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3">Trip</th>
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Driver</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {recentTrips.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      No matching trips found
                    </td>
                  </tr>
                ) : (
                  recentTrips.map((trip) => {
                    const vehicleObj = vehicles.find((v) => v.id === trip.vehicleId);
                    const driverObj = drivers.find((d) => d.id === trip.driverId);
                    return (
                      <tr key={trip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{trip.id}</td>
                        <td className="px-6 py-4">{vehicleObj ? vehicleObj.model : "—"}</td>
                        <td className="px-6 py-4">{driverObj ? driverObj.name : "—"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold inline-block border ${
                              trip.status === "Completed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : trip.status === "Dispatched"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                : trip.status === "Cancelled"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                            }`}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-medium">{trip.eta || "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Progress Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-6">Vehicle Status Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: "Available", count: statusCounts.Available, percentage: statusPercentages.Available, bg: "bg-emerald-500" },
                { label: "On Trip", count: statusCounts.OnTrip, percentage: statusPercentages.OnTrip, bg: "bg-blue-500" },
                { label: "In Shop", count: statusCounts.InShop, percentage: statusPercentages.InShop, bg: "bg-amber-500" },
                { label: "Retired", count: statusCounts.Retired, percentage: statusPercentages.Retired, bg: "bg-red-400" },
              ].map((status, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">{status.label}</span>
                    <span className="text-slate-950 dark:text-white">
                      {status.count} ({status.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${status.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-blue-500" />
            <span>Total Filtered Vehicles: {totalVehiclesCount} units.</span>
          </div>
        </div>
      </div>

      {/* Additional Analytics Rows (Alerts, Leaderboard, Activities) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Compliance & License Expiry Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Compliance & Alerts</h3>
          </div>
          <div className="space-y-3">
            {licenseExpiryAlerts.map((driver) => (
              <div key={driver.id} className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/40 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{driver.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">License: {driver.licenseNumber}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 font-bold uppercase text-[9px] border border-red-500/20">
                  {driver.licenseExpiry}
                </span>
              </div>
            ))}
            {upcomingMaintenance.map((log) => {
              const vehicle = vehicles.find(v => v.id === log.vehicleId);
              return (
                <div key={log.id} className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/40 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{vehicle?.model || "Vehicle"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Shop: {log.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold uppercase text-[9px] border border-amber-500/20">
                    IN SHOP
                  </span>
                </div>
              );
            })}
            {licenseExpiryAlerts.length === 0 && upcomingMaintenance.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">No active compliance alerts.</div>
            )}
          </div>
        </div>

        {/* Driver Leaderboard */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Top Safety Leaderboard</h3>
          </div>
          <div className="space-y-3">
            {topDrivers.map((driver, idx) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    idx === 0 ? "bg-amber-500/10 text-amber-500" : idx === 1 ? "bg-slate-400/25 text-slate-500" : "bg-orange-700/10 text-orange-600"
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{driver.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">License Category: {driver.licenseCategory}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{driver.safetyScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Recent Activity Feed</h3>
          </div>
          <div className="space-y-3">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex gap-3 text-xs leading-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-600 dark:text-slate-300">{act.text}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}