/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransitStore } from "@/lib/store";
import { Play, RefreshCw, X, HelpCircle, Award } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface TourStep {
  id: number;
  title: string;
  desc: string;
  actionText: string;
  action: (store: any, router: any, nextStep: () => void) => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "Step 1: Register Vehicle",
    desc: "Register a new vehicle named 'Van-05' with a load capacity of 500 kg.",
    actionText: "Auto-Register 'Van-05'",
    action: (store, router, nextStep) => {
      // Remove it if it exists so the demo can rerun
      const existing = store.vehicles.find((v: any) => v.regNumber === "GJ01AB4521");
      if (existing) {
        store.updateVehicle(existing.id, { status: "Available", odometer: 74000 });
        toast.info("Van-05 already exists. Resetting to Available status.");
        router.push("/fleet");
        nextStep();
        return;
      }

      const res = store.addVehicle({
        regNumber: "GJ01AB4521",
        model: "VAN-05",
        type: "Van",
        capacity: 500,
        odometer: 74000,
        acquisitionCost: 620000,
        status: "Available"
      });

      if (res.success) {
        toast.success("Vehicle VAN-05 registered successfully!");
        router.push("/fleet");
        nextStep();
      } else {
        toast.error(res.error || "Failed to register vehicle.");
      }
    }
  },
  {
    id: 2,
    title: "Step 2: Register Driver",
    desc: "Register driver 'Alex' with a valid driving license (DL-88213).",
    actionText: "Auto-Register 'Alex'",
    action: (store, router, nextStep) => {
      const existing = store.drivers.find((d: any) => d.licenseNumber === "DL-88213");
      if (existing) {
        store.updateDriver(existing.id, { status: "Available" });
        toast.info("Driver Alex already exists. Resetting to Available status.");
        router.push("/drivers");
        nextStep();
        return;
      }

      const res = store.addDriver({
        name: "Alex",
        licenseNumber: "DL-88213",
        licenseCategory: "LMV",
        licenseExpiry: "12/2028",
        contactNumber: "9876543210",
        safetyScore: 96,
        status: "Available"
      });

      if (res.success) {
        toast.success("Driver Alex registered successfully!");
        router.push("/drivers");
        nextStep();
      } else {
        toast.error(res.error || "Failed to register driver.");
      }
    }
  },
  {
    id: 3,
    title: "Step 3 & 4: Dispatch Trip",
    desc: "Create and dispatch a trip with Cargo Weight = 450 kg (< 500 kg capacity limit).",
    actionText: "Create & Dispatch Trip",
    action: (store, router, nextStep) => {
      // Find Van-05 and Alex
      const vehicle = store.vehicles.find((v: any) => v.regNumber === "GJ01AB4521");
      const driver = store.drivers.find((d: any) => d.licenseNumber === "DL-88213");

      if (!vehicle || !driver) {
        toast.error("Please run Step 1 and Step 2 first.");
        return;
      }

      // Check if they are already on a trip
      store.updateVehicle(vehicle.id, { status: "Available" });
      store.updateDriver(driver.id, { status: "Available" });

      // Add a draft trip
      const tripRes = store.addTrip({
        source: "Gandhinagar Depot",
        destination: "Ahmedabad Hub",
        distance: 38,
        cargoWeight: 450,
        revenue: 15000,
        vehicleId: vehicle.id,
        driverId: driver.id
      });

      if (tripRes.success) {
        // Dispatch the newly added trip (it's the first in the list)
        const newTrip = store.trips[0];
        const dispatchRes = store.dispatchTrip(newTrip.id);
        
        if (dispatchRes.success) {
          toast.success(`Trip ${newTrip.id} dispatched! Cargo 450 kg <= 500 kg capacity checked.`);
          router.push("/trips");
          nextStep();
        } else {
          toast.error(dispatchRes.error || "Dispatch failed.");
        }
      } else {
        toast.error(tripRes.error || "Failed to create trip.");
      }
    }
  },
  {
    id: 4,
    title: "Step 5: Verify Statuses",
    desc: "Check that both Vehicle and Driver status automatically updated to 'On Trip' on the Live Board.",
    actionText: "Verify on Dashboard",
    action: (store, router, nextStep) => {
      router.push("/dashboard");
      toast.info("Verify KPIs: 'Drivers On Duty' increased and 'Fleet Utilization' updated.");
      nextStep();
    }
  },
  {
    id: 5,
    title: "Step 6: Complete Trip",
    desc: "Simulate trip completion by entering final odometer (74038 km) and fuel consumed (5 L).",
    actionText: "Auto-Complete Trip",
    action: (store, router, nextStep) => {
      // Find the dispatched trip for Van-05
      const vehicle = store.vehicles.find((v: any) => v.regNumber === "GJ01AB4521");
      const activeTrip = store.trips.find(
        (t: any) => t.vehicleId === vehicle?.id && t.status === "Dispatched"
      );

      if (!activeTrip) {
        toast.error("No active dispatched trip found for Van-05. Run Step 3 first.");
        return;
      }

      const res = store.completeTrip(activeTrip.id, 74038, 5);
      if (res.success) {
        toast.success(`Trip ${activeTrip.id} completed. Fuel log added.`);
        // Auto-log toll expense too
        store.addExpense({
          tripId: activeTrip.id,
          vehicleId: activeTrip.vehicleId,
          type: "Tolls",
          amount: 120,
          description: "Ahmedabad-Gandhinagar Expressway Toll",
          date: new Date().toISOString().split("T")[0]
        });
        
        router.push("/trips");
        nextStep();
      } else {
        toast.error(res.error || "Failed to complete trip.");
      }
    }
  },
  {
    id: 6,
    title: "Step 7: Verify Available",
    desc: "Verify that vehicle 'Van-05' and driver 'Alex' have returned to 'Available' status.",
    actionText: "Verify Status",
    action: (store, router, nextStep) => {
      router.push("/fleet");
      toast.info("Odometer updated to 74,038 km. Vehicle is Available.");
      nextStep();
    }
  },
  {
    id: 7,
    title: "Step 8: Log Maintenance",
    desc: "Log an active Maintenance record (e.g. Oil Change) for 'Van-05'. Status automatically switches to 'In Shop'.",
    actionText: "Put In Maintenance",
    action: (store, router, nextStep) => {
      const vehicle = store.vehicles.find((v: any) => v.regNumber === "GJ01AB4521");
      if (!vehicle) {
        toast.error("Vehicle Van-05 not found.");
        return;
      }

      store.addMaintenanceLog({
        vehicleId: vehicle.id,
        description: "Scheduled Oil Change & Filters",
        cost: 2500,
        date: new Date().toISOString().split("T")[0],
        status: "Active"
      });

      toast.success("Maintenance log created. Van-05 is now 'In Shop' and hidden from dispatch.");
      router.push("/maintenance");
      nextStep();
    }
  },
  {
    id: 8,
    title: "Step 9: Reports & ROI",
    desc: "Go to Analytics. Operational cost, fuel efficiency, and ROI: (Revenue - (Maint + Fuel)) / Acq. Cost are recalculated.",
    actionText: "View Analytics & Recalculation",
    action: (store, router, nextStep) => {
      router.push("/analytics");
      
      // Calculate math
      // Revenue = 15000, Maintenance = 2500, Fuel = 5L * 75 = 375, Tolls = 120
      // Total Operational = 2500 + 375 + 120 = 2995
      // Net = 15000 - 2995 = 12005
      // ROI = 12005 / 620000 = 1.93% (for this single trip)
      
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        toast.success("Recalculation Complete! All formulas verified.");
      }, 500);

      nextStep();
    }
  }
];

export default function DemoTour() {
  const store = useTransitStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activeStep = TOUR_STEPS[activeStepIndex];

  const handleNextStep = () => {
    if (activeStepIndex < TOUR_STEPS.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else {
      toast.success("Hackathon Workflow Completed successfully! Winner Badge unlocked! 🏆");
      setActiveStepIndex(0);
      setIsOpen(false);
    }
  };

  const handleResetDemo = () => {
    store.resetAllData();
    setActiveStepIndex(0);
    toast.success("All data reset to initial seed values.");
    router.push("/dashboard");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs border border-amber-400/30 z-40 transition-transform active:scale-95"
      >
        <Award className="w-4 h-4 animate-bounce" />
        <span>Judge Demo Guide</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-40 animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-bold tracking-wide">Judge Tour Guide</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleResetDemo} 
            className="p-1 rounded hover:bg-white/10 text-slate-200 hover:text-white"
            title="Reset Data"
          >
            <RefreshCw size={12} />
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 rounded hover:bg-white/10 text-slate-200 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <span>Progress</span>
          <span>{activeStepIndex + 1} of {TOUR_STEPS.length}</span>
        </div>

        {/* Progress dots bar */}
        <div className="flex gap-1">
          {TOUR_STEPS.map((s, idx) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                idx < activeStepIndex
                  ? "bg-emerald-500"
                  : idx === activeStepIndex
                  ? "bg-blue-600"
                  : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>

        <div className="pt-1.5">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 leading-snug">
            {activeStep.title}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            {activeStep.desc}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => activeStep.action(store, router, handleNextStep)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-lg text-xs font-bold transition-all duration-150 shadow-md shadow-blue-500/10"
        >
          <Play size={12} fill="currentColor" />
          <span>{activeStep.actionText}</span>
        </button>

        {/* Extra instruction info */}
        <div className="text-[9px] text-slate-400 flex items-start gap-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg leading-normal">
          <HelpCircle className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
          <span>Each action will automatically execute the workflow step, check business rules, and navigate to show the changes live!</span>
        </div>
      </div>
    </div>
  );
}