import { create } from "zustand";

export type Role = "FLEET_MANAGER" | "DRIVER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST";

export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface User {
  email: string;
  name: string;
  role: Role;
}

export interface VehicleDocument {
  id: string;
  name: string;
  fileName: string;
  status: "Active" | "Expired";
  expiryDate: string;
}

export interface Vehicle {
  id: string;
  regNumber: string;
  model: string;
  type: "Van" | "Truck" | "Mini";
  capacity: number; // in kg
  odometer: number; // in km
  acquisitionCost: number; // in INR
  status: VehicleStatus;
  documents?: VehicleDocument[];
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: "LMV" | "HMV";
  licenseExpiry: string; // "YYYY-MM" or "MM/YYYY"
  contactNumber: string;
  safetyScore: number; // 0-100 percentage
  status: DriverStatus;
}

export interface Trip {
  id: string; // e.g. "TR001"
  source: string;
  destination: string;
  distance: number; // in km
  cargoWeight: number; // in kg
  revenue: number; // in INR
  status: TripStatus;
  vehicleId: string; // empty string if unassigned
  driverId: string; // empty string if unassigned
  startOdometer: number;
  endOdometer?: number;
  fuelConsumed?: number; // in liters
  eta?: string; // e.g. "45 min" or "1h 10m"
  date: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  date: string;
  status: "Active" | "Closed";
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
}

export interface Expense {
  id: string;
  tripId?: string;
  vehicleId: string;
  type: string; // "Tolls" | "Permit" | "Insurance" | "Other"
  amount: number;
  description: string;
  date: string;
}

export interface Settings {
  depotName: string;
  currency: string;
  distanceUnit: string;
}

export interface ActivityLog {
  id: string;
  type: "trip" | "maintenance" | "completion" | "expense" | "system";
  text: string;
  timestamp: string;
}

// Initial Predefined Users (Credentials for RBAC)
export const PREDEFINED_USERS: Record<string, User & { password?: string }> = {
  "manager@transitops.in": { name: "Vikram Mehta", role: "FLEET_MANAGER", email: "manager@transitops.in", password: "password123" },
  "driver@transitops.in": { name: "Raven K.", role: "DRIVER", email: "driver@transitops.in", password: "password123" },
  "safety@transitops.in": { name: "Neha Sharma", role: "SAFETY_OFFICER", email: "safety@transitops.in", password: "password123" },
  "analyst@transitops.in": { name: "Amit Patel", role: "FINANCIAL_ANALYST", email: "analyst@transitops.in", password: "password123" }
};

interface TransitOpsState {
  // Auth state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Data arrays
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  settings: Settings;
  notifications: Array<{ id: string; type: "info" | "warning" | "error" | "success"; message: string; date: string }>;
  activities: ActivityLog[];

  // Mutations
  addActivity: (type: ActivityLog["type"], text: string) => void;

  // Mutations
  addVehicle: (vehicle: Omit<Vehicle, "id">) => { success: boolean; error?: string };
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  uploadVehicleDocument: (vehicleId: string, doc: Omit<VehicleDocument, "id">) => void;
  addDriver: (driver: Omit<Driver, "id">) => { success: boolean; error?: string };
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  addTrip: (trip: Omit<Trip, "id" | "status" | "startOdometer" | "date">) => { success: boolean; error?: string };
  dispatchTrip: (id: string) => { success: boolean; error?: string };
  completeTrip: (id: string, finalOdometer: number, fuelConsumed: number) => { success: boolean; error?: string };
  cancelTrip: (id: string) => { success: boolean; error?: string };
  addMaintenanceLog: (log: Omit<MaintenanceLog, "id">) => void;
  closeMaintenanceLog: (id: string) => void;
  addFuelLog: (log: Omit<FuelLog, "id">) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateSettings: (settings: Settings) => void;
  clearNotifications: () => void;
  resetAllData: () => void;
}

// 20 Seed Vehicles
const SEED_VEHICLES: Vehicle[] = [
  { id: "v1", regNumber: "GJ01AB4521", model: "VAN-05", type: "Van", capacity: 500, odometer: 74000, acquisitionCost: 620000, status: "Available", documents: [
    { id: "doc1", name: "Insurance Policy Certificate", fileName: "van05_insurance_2026.pdf", status: "Active", expiryDate: "12/2026" },
    { id: "doc2", name: "Pollution Under Control (PUC)", fileName: "van05_puc_expired.pdf", status: "Expired", expiryDate: "05/2025" }
  ] },
  { id: "v2", regNumber: "GJ01AB9981", model: "TRUCK-11", type: "Truck", capacity: 5000, odometer: 182000, acquisitionCost: 2450000, status: "On Trip", documents: [
    { id: "doc3", name: "National Road Permit", fileName: "truck11_permit_2027.pdf", status: "Active", expiryDate: "08/2027" }
  ] },
  { id: "v3", regNumber: "GJ01AB1120", model: "MINI-03", type: "Mini", capacity: 1000, odometer: 66000, acquisitionCost: 410000, status: "In Shop" },
  { id: "v4", regNumber: "GJ01AB0008", model: "VAN-09", type: "Van", capacity: 750, odometer: 241900, acquisitionCost: 590000, status: "Retired" },
  { id: "v5", regNumber: "GJ01AB2231", model: "TRUCK-04", type: "Truck", capacity: 8000, odometer: 125000, acquisitionCost: 2800000, status: "Available" },
  { id: "v6", regNumber: "GJ01AB1442", model: "MINI-08", type: "Mini", capacity: 1200, odometer: 89000, acquisitionCost: 450000, status: "On Trip" },
  { id: "v7", regNumber: "GJ01AB6711", model: "TRUCK-12", type: "Truck", capacity: 6000, odometer: 145000, acquisitionCost: 2200000, status: "Available" },
  { id: "v8", regNumber: "GJ01AB3309", model: "VAN-04", type: "Van", capacity: 400, odometer: 42000, acquisitionCost: 480000, status: "Available" },
  { id: "v9", regNumber: "GJ01AB8821", model: "TRUCK-08", type: "Truck", capacity: 7000, odometer: 195000, acquisitionCost: 2600000, status: "Available" },
  { id: "v10", regNumber: "GJ01AB4119", model: "MINI-02", type: "Mini", capacity: 900, odometer: 51000, acquisitionCost: 380000, status: "Available" },
  { id: "v11", regNumber: "GJ01AB9921", model: "TRUCK-15", type: "Truck", capacity: 10000, odometer: 215000, acquisitionCost: 3100000, status: "Available" },
  { id: "v12", regNumber: "GJ01AB5512", model: "VAN-12", type: "Van", capacity: 600, odometer: 68000, acquisitionCost: 520000, status: "Available" },
  { id: "v13", regNumber: "GJ01AB8876", model: "TRUCK-02", type: "Truck", capacity: 4500, odometer: 132000, acquisitionCost: 1950000, status: "Available" },
  { id: "v14", regNumber: "GJ01AB1104", model: "MINI-06", type: "Mini", capacity: 1500, odometer: 95000, acquisitionCost: 490000, status: "Available" },
  { id: "v15", regNumber: "GJ01AB3390", model: "TRUCK-07", type: "Truck", capacity: 5500, odometer: 164000, acquisitionCost: 2300000, status: "Available" },
  { id: "v16", regNumber: "GJ01AB1249", model: "VAN-08", type: "Van", capacity: 500, odometer: 81000, acquisitionCost: 500000, status: "Available" },
  { id: "v17", regNumber: "GJ01AB8833", model: "TRUCK-09", type: "Truck", capacity: 9000, odometer: 202000, acquisitionCost: 2950000, status: "Available" },
  { id: "v18", regNumber: "GJ01AB7732", model: "MINI-01", type: "Mini", capacity: 800, odometer: 39000, acquisitionCost: 360000, status: "Available" },
  { id: "v19", regNumber: "GJ01AB4481", model: "TRUCK-03", type: "Truck", capacity: 8500, odometer: 110000, acquisitionCost: 2700000, status: "Available" },
  { id: "v20", regNumber: "GJ01AB6601", model: "VAN-01", type: "Van", capacity: 450, odometer: 32000, acquisitionCost: 460000, status: "Available" }
];

// 35 Seed Drivers
const SEED_DRIVERS: Driver[] = [
  { id: "d1", name: "Alex", licenseNumber: "DL-88213", licenseCategory: "LMV", licenseExpiry: "12/2028", contactNumber: "9876543210", safetyScore: 96, status: "Available" },
  { id: "d2", name: "John", licenseNumber: "DL-44120", licenseCategory: "HMV", licenseExpiry: "05/2025 EXPIRED", contactNumber: "9822011442", safetyScore: 81, status: "Suspended" },
  { id: "d3", name: "Priya", licenseNumber: "DL-77031", licenseCategory: "LMV", licenseExpiry: "08/2026", contactNumber: "9911077651", safetyScore: 99, status: "On Trip" },
  { id: "d4", name: "Suresh", licenseNumber: "DL-90045", licenseCategory: "HMV", licenseExpiry: "01/2027", contactNumber: "9744033221", safetyScore: 88, status: "Off Duty" },
  { id: "d5", name: "Rahul", licenseNumber: "DL-66551", licenseCategory: "HMV", licenseExpiry: "09/2029", contactNumber: "9854499881", safetyScore: 96, status: "Available" },
  { id: "d6", name: "Vikram", licenseNumber: "DL-22345", licenseCategory: "HMV", licenseExpiry: "11/2027", contactNumber: "9871122334", safetyScore: 92, status: "Available" },
  { id: "d7", name: "Amit", licenseNumber: "DL-99887", licenseCategory: "HMV", licenseExpiry: "04/2028", contactNumber: "9988776655", safetyScore: 85, status: "Available" },
  { id: "d8", name: "Sanjay", licenseNumber: "DL-44332", licenseCategory: "HMV", licenseExpiry: "02/2025 EXPIRED", contactNumber: "9776655443", safetyScore: 78, status: "Suspended" },
  { id: "d9", name: "Neha", licenseNumber: "DL-11223", licenseCategory: "LMV", licenseExpiry: "07/2029", contactNumber: "9554433221", safetyScore: 94, status: "Available" },
  { id: "d10", name: "Anil", licenseNumber: "DL-55667", licenseCategory: "HMV", licenseExpiry: "10/2026", contactNumber: "9443322110", safetyScore: 90, status: "Available" },
  // Remaining 25 drivers for demo scalability
  ...Array.from({ length: 25 }).map((_, index) => {
    const dId = index + 11;
    const names = ["Rajesh", "Karan", "Sunil", "Manoj", "Vijay", "Deepak", "Rohan", "Sachin", "Ajay", "Harish", "Gopal", "Ramesh", "Preeti", "Kavita", "Ritu", "Jyoti", "Aman", "Alok", "Dev", "Yash", "Prem", "Om", "Hari", "Shiv", "Raj"];
    const isExpired = dId === 18 || dId === 25;
    return {
      id: `d${dId}`,
      name: names[index % names.length] + ` ${String.fromCharCode(65 + (index % 26))}.`,
      licenseNumber: `DL-90${100 + dId}`,
      licenseCategory: (dId % 3 === 0 ? "LMV" : "HMV") as "LMV" | "HMV",
      licenseExpiry: isExpired ? "03/2026 EXPIRED" : `0${(dId % 9) + 1}/2030`,
      contactNumber: `9810${1000 + dId}`,
      safetyScore: 75 + (dId % 25),
      status: (dId === 12 ? "Suspended" : dId === 15 ? "Off Duty" : "Available") as DriverStatus
    };
  })
];

// Seed Trips (generating completed/dispatched/cancelled histories)
const SEED_TRIPS: Trip[] = [
  { id: "TR001", source: "Gandhinagar Depot", destination: "Ahmedabad Hub", distance: 38, cargoWeight: 450, revenue: 15000, status: "Dispatched", vehicleId: "v1", driverId: "d1", startOdometer: 74000, eta: "45 min", date: "2026-07-12" },
  { id: "TR002", source: "Mehsana Hub", destination: "Vatva Depot", distance: 95, cargoWeight: 4800, revenue: 54000, status: "Completed", vehicleId: "v2", driverId: "d3", startOdometer: 181905, endOdometer: 182000, fuelConsumed: 42, eta: "—", date: "2026-07-11" },
  { id: "TR003", source: "Mansa Depot", destination: "Kalol Hub", distance: 28, cargoWeight: 1100, revenue: 12000, status: "Cancelled", vehicleId: "v3", driverId: "d4", startOdometer: 66000, eta: "—", date: "2026-07-12" },
  { id: "TR004", source: "Vatva Industrial Area", destination: "Sanand Warehouse", distance: 55, cargoWeight: 7500, revenue: 42000, status: "Draft", vehicleId: "v5", driverId: "d6", startOdometer: 125000, eta: "Awaiting driver", date: "2026-07-12" },
  ...Array.from({ length: 146 }).map((_, index) => {
    const tId = index + 5;
    const distance = 40 + (index % 10) * 15;
    const weight = 300 + (index % 8) * 400;
    const rev = distance * 220 + weight * 2;
    const vId = `v${(index % 17) + 4}`;
    const dId = `d${(index % 25) + 7}`;
    return {
      id: `TR${String(tId).padStart(3, "0")}`,
      source: ["Gandhinagar Depot", "Vatva Industrial Area", "Ahmedabad Airport", "Sanand Hub", "Nadiad GIDC", "Kheda Depot"][index % 6],
      destination: ["Baroda Logistics Park", "Surat Hub", "Kalol Depot", "Anand GIDC", "Rajkot Warehouse", "Jamnagar Depot"][index % 6],
      distance,
      cargoWeight: weight,
      revenue: Math.round(rev),
      status: "Completed" as TripStatus,
      vehicleId: vId,
      driverId: dId,
      startOdometer: 10000 + index * 500,
      endOdometer: 10000 + index * 500 + distance,
      fuelConsumed: Math.round(distance / (6 + (index % 4))),
      date: `2026-07-${String(Math.max(1, 12 - (index % 12))).padStart(2, "0")}`
    };
  })
];

// Seed Maintenance Logs
const SEED_MAINTENANCE: MaintenanceLog[] = [
  { id: "m1", vehicleId: "v1", description: "Oil Change", cost: 2500, date: "2026-07-07", status: "Active" },
  { id: "m2", vehicleId: "v2", description: "Engine Repair", cost: 18000, date: "2026-07-05", status: "Closed" },
  { id: "m3", vehicleId: "v3", description: "Tyre Replace", cost: 6200, date: "2026-07-06", status: "Active" }
];

// Seed Fuel Logs
const SEED_FUEL: FuelLog[] = [
  { id: "f1", vehicleId: "v1", date: "2026-07-05", liters: 42, cost: 3150 },
  { id: "f2", vehicleId: "v2", date: "2026-07-06", liters: 110, cost: 8400 },
  { id: "f3", vehicleId: "v6", date: "2026-07-06", liters: 28, cost: 2050 }
];

// Seed Other Expenses
const SEED_EXPENSES: Expense[] = [
  { id: "e1", tripId: "TR001", vehicleId: "v1", type: "Tolls", amount: 120, description: "NH48 Toll Plaza", date: "2026-07-12" },
  { id: "e2", tripId: "TR002", vehicleId: "v2", type: "Other", amount: 150, description: "Driver food & rest", date: "2026-07-11" }
];

// Seed Notifications
const SEED_NOTIFICATIONS = [
  { id: "n1", type: "warning" as const, message: "Vehicle TRK-08 requires scheduled maintenance soon.", date: "Today, 09:12" },
  { id: "n2", type: "error" as const, message: "Driver John's license has expired (05/2025). Assignment blocked.", date: "Today, 08:30" },
  { id: "n3", type: "info" as const, message: "Vehicle VAN-04 has been idle for 4 days (low utilization).", date: "Yesterday" },
  { id: "n4", type: "success" as const, message: "Trip TR002 completed successfully. Revenue logged.", date: "Yesterday" }
];

const SEED_ACTIVITIES: ActivityLog[] = [
  { id: "a1", type: "trip", text: "Trip TR001 dispatched to Ahmedabad Hub.", timestamp: "10 mins ago" },
  { id: "a2", type: "maintenance", text: "Vehicle VAN-05 put into maintenance shop (Oil Change).", timestamp: "1 hour ago" },
  { id: "a3", type: "completion", text: "Trip TR002 completed. Odometer updated to 182,000 km.", timestamp: "4 hours ago" },
  { id: "a4", type: "expense", text: "Toll log of ₹120 submitted for Trip TR001.", timestamp: "5 hours ago" }
];

const LOCAL_STORAGE_KEY = "transitops_v1_store";

// Helper to load state from local storage or use defaults
const getInitialState = () => {
  const defaults = {
    currentUser: PREDEFINED_USERS["driver@transitops.in"], // Default to Driver (Raven K.) for mockup matching
    vehicles: SEED_VEHICLES,
    drivers: SEED_DRIVERS,
    trips: SEED_TRIPS,
    maintenanceLogs: SEED_MAINTENANCE,
    fuelLogs: SEED_FUEL,
    expenses: SEED_EXPENSES,
    settings: {
      depotName: "Gandhinagar Depot GJ14",
      currency: "INR (Rs)",
      distanceUnit: "Kilometers"
    },
    notifications: SEED_NOTIFICATIONS,
    activities: SEED_ACTIVITIES
  };

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaults,
          ...parsed
        };
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }
  return defaults;
};

export const useTransitStore = create<TransitOpsState>((set, get) => {
  const saveState = (newState: Partial<TransitOpsState>) => {
    if (typeof window !== "undefined") {
      const current = get();
      const stateToSave = {
        currentUser: current.currentUser,
        vehicles: current.vehicles,
        drivers: current.drivers,
        trips: current.trips,
        maintenanceLogs: current.maintenanceLogs,
        fuelLogs: current.fuelLogs,
        expenses: current.expenses,
        settings: current.settings,
        notifications: current.notifications,
        activities: current.activities,
        ...newState
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  };

  const initialState = getInitialState();

  return {
    ...initialState,

    addActivity: (type, text) => {
      const newLog: ActivityLog = {
        id: `act_${Date.now()}`,
        type,
        text,
        timestamp: "Just now"
      };
      const updated = [newLog, ...get().activities].slice(0, 50); // limit to last 50 activities
      set({ activities: updated });
      saveState({ activities: updated });
    },

    setCurrentUser: (user) => {
      set({ currentUser: user });
      saveState({ currentUser: user });
    },

    addVehicle: (vehicle) => {
      // Rule 1: Registration number must be unique
      const exists = get().vehicles.some(
        (v) => v.regNumber.toUpperCase() === vehicle.regNumber.toUpperCase()
      );
      if (exists) {
        return { success: false, error: "Vehicle with this registration number already exists." };
      }
      const newVehicle: Vehicle = {
        ...vehicle,
        id: `v${Date.now()}`
      };
      set((state) => {
        const updated = [...state.vehicles, newVehicle];
        saveState({ vehicles: updated });
        return { vehicles: updated };
      });
      get().addActivity("system", `Registered new vehicle ${vehicle.model} (${vehicle.regNumber.toUpperCase()}).`);
      return { success: true };
    },

    updateVehicle: (id, updates) => {
      set((state) => {
        const updated = state.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v));
        saveState({ vehicles: updated });
        return { vehicles: updated };
      });
    },

    deleteVehicle: (id) => {
      const v = get().vehicles.find((veh) => veh.id === id);
      set((state) => {
        const updated = state.vehicles.filter((veh) => veh.id !== id);
        saveState({ vehicles: updated });
        return { vehicles: updated };
      });
      if (v) {
        get().addActivity("system", `Removed vehicle ${v.model} (${v.regNumber}) from fleet.`);
      }
    },

    uploadVehicleDocument: (vehicleId, doc) => {
      const newDoc: VehicleDocument = {
        ...doc,
        id: `doc_${Date.now()}`
      };
      set((state) => {
        const updated = state.vehicles.map((v) => {
          if (v.id === vehicleId) {
            const docs = v.documents || [];
            return {
              ...v,
              documents: [...docs, newDoc]
            };
          }
          return v;
        });
        saveState({ vehicles: updated });
        return { vehicles: updated };
      });
      const vehicle = get().vehicles.find(v => v.id === vehicleId);
      get().addActivity("system", `Uploaded document '${doc.name}' for ${vehicle ? vehicle.model : "vehicle"}.`);
    },

    addDriver: (driver) => {
      // Enforce unique license numbers
      const exists = get().drivers.some(
        (d) => d.licenseNumber.toUpperCase() === driver.licenseNumber.toUpperCase()
      );
      if (exists) {
        return { success: false, error: "Driver with this license number already exists." };
      }
      const newDriver: Driver = {
        ...driver,
        id: `d${Date.now()}`
      };
      set((state) => {
        const updated = [...state.drivers, newDriver];
        saveState({ drivers: updated });
        return { drivers: updated };
      });
      get().addActivity("system", `Registered new driver ${driver.name}.`);
      return { success: true };
    },

    updateDriver: (id, updates) => {
      set((state) => {
        const updated = state.drivers.map((d) => (d.id === id ? { ...d, ...updates } : d));
        saveState({ drivers: updated });
        return { vehicles: state.vehicles, drivers: updated };
      });
    },

    deleteDriver: (id) => {
      const d = get().drivers.find((drv) => drv.id === id);
      set((state) => {
        const updated = state.drivers.filter((drv) => drv.id !== id);
        saveState({ drivers: updated });
        return { drivers: updated };
      });
      if (d) {
        get().addActivity("system", `Removed driver ${d.name} from directory.`);
      }
    },

    addTrip: (trip) => {
      // Enforce: Cargo Weight must not exceed the vehicle's maximum load capacity
      const vehicle = get().vehicles.find((v) => v.id === trip.vehicleId);
      if (vehicle && trip.cargoWeight > vehicle.capacity) {
        return { success: false, error: `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg).` };
      }

      // Check driver eligibility (expired license check)
      const driver = get().drivers.find((d) => d.id === trip.driverId);
      if (driver && isLicenseExpired(driver.licenseExpiry)) {
        return { success: false, error: "Cannot assign driver with expired license." };
      }
      if (driver && driver.status === "Suspended") {
        return { success: false, error: "Cannot assign suspended driver." };
      }

      const tripId = `TR${String(get().trips.length + 1).padStart(3, "0")}`;
      const newTrip: Trip = {
        ...trip,
        id: tripId,
        status: "Draft",
        startOdometer: vehicle ? vehicle.odometer : 0,
        date: new Date().toISOString().split("T")[0]
      };

      set((state) => {
        const updated = [newTrip, ...state.trips];
        saveState({ trips: updated });
        return { trips: updated };
      });
      get().addActivity("trip", `Trip draft ${tripId} created from ${trip.source} to ${trip.destination}.`);
      return { success: true };
    },

    dispatchTrip: (id) => {
      const trip = get().trips.find((t) => t.id === id);
      if (!trip) return { success: false, error: "Trip not found." };

      const vehicle = get().vehicles.find((v) => v.id === trip.vehicleId);
      const driver = get().drivers.find((d) => d.id === trip.driverId);

      // Business Rules Check
      if (!vehicle || vehicle.status === "In Shop" || vehicle.status === "Retired" || vehicle.status === "On Trip") {
        return { success: false, error: "Vehicle is not available for dispatch." };
      }
      if (!driver || driver.status === "Suspended" || driver.status === "On Trip" || driver.licenseExpiry.toUpperCase().includes("EXPIRED")) {
        return { success: false, error: "Driver is not available for dispatch." };
      }

      // Dispatching changes both vehicle and driver to On Trip
      set((state) => {
        const updatedTrips = state.trips.map((t) => (t.id === id ? { ...t, status: "Dispatched" as TripStatus, eta: "45 min" } : t));
        const updatedVehicles = state.vehicles.map((v) => (v.id === trip.vehicleId ? { ...v, status: "On Trip" as VehicleStatus } : v));
        const updatedDrivers = state.drivers.map((d) => (d.id === trip.driverId ? { ...d, status: "On Trip" as DriverStatus } : d));

        saveState({ trips: updatedTrips, vehicles: updatedVehicles, drivers: updatedDrivers });
        return { trips: updatedTrips, vehicles: updatedVehicles, drivers: updatedDrivers };
      });
      get().addActivity("trip", `Trip ${id} dispatched to ${trip.destination}.`);
      return { success: true };
    },

    completeTrip: (id, finalOdometer, fuelConsumed) => {
      const trip = get().trips.find((t) => t.id === id);
      if (!trip) return { success: false, error: "Trip not found." };

      const vehicle = get().vehicles.find((v) => v.id === trip.vehicleId);
      if (vehicle && finalOdometer < vehicle.odometer) {
        return { success: false, error: `Final odometer (${finalOdometer}) cannot be less than starting odometer (${vehicle.odometer}).` };
      }

      // Completing a trip restores both to Available, updates vehicle odometer, logs fuel
      set((state) => {
        const updatedTrips = state.trips.map((t) =>
          t.id === id
            ? { ...t, status: "Completed" as TripStatus, endOdometer: finalOdometer, fuelConsumed, eta: "—" }
            : t
        );
        const updatedVehicles = state.vehicles.map((v) =>
          v.id === trip.vehicleId
            ? { ...v, status: "Available" as VehicleStatus, odometer: finalOdometer }
            : v
        );
        const updatedDrivers = state.drivers.map((d) =>
          d.id === trip.driverId
            ? { ...d, status: "Available" as DriverStatus }
            : d
        );

        // Auto log fuel in fuel logs
        const newFuelLog: FuelLog = {
          id: `f${Date.now()}`,
          vehicleId: trip.vehicleId,
          date: new Date().toISOString().split("T")[0],
          liters: fuelConsumed,
          cost: fuelConsumed * 75 // Assuming fuel rate is Rs 75/liter
        };

        const updatedFuelLogs = [...state.fuelLogs, newFuelLog];
        const newNotification = {
          id: `n${Date.now()}`,
          type: "success" as const,
          message: `Trip ${trip.id} completed. Vehicle odometer updated to ${finalOdometer} km.`,
          date: "Just now"
        };
        const updatedNotifications = [newNotification, ...state.notifications];

        saveState({
          trips: updatedTrips,
          vehicles: updatedVehicles,
          drivers: updatedDrivers,
          fuelLogs: updatedFuelLogs,
          notifications: updatedNotifications
        });

        return {
          trips: updatedTrips,
          vehicles: updatedVehicles,
          drivers: updatedDrivers,
          fuelLogs: updatedFuelLogs,
          notifications: updatedNotifications
        };
      });
      get().addActivity("completion", `Trip ${id} completed. Odometer updated to ${finalOdometer} km.`);
      return { success: true };
    },

    cancelTrip: (id) => {
      const trip = get().trips.find((t) => t.id === id);
      if (!trip) return { success: false, error: "Trip not found." };

      // Cancelling a dispatched trip restores vehicle & driver to Available
      set((state) => {
        const updatedTrips = state.trips.map((t) => (t.id === id ? { ...t, status: "Cancelled" as TripStatus, eta: "—" } : t));
        const updatedVehicles = state.vehicles.map((v) =>
          v.id === trip.vehicleId && v.status === "On Trip"
            ? { ...v, status: "Available" as VehicleStatus }
            : v
        );
        const updatedDrivers = state.drivers.map((d) =>
          d.id === trip.driverId && d.status === "On Trip"
            ? { ...d, status: "Available" as DriverStatus }
            : d
        );

        saveState({ trips: updatedTrips, vehicles: updatedVehicles, drivers: updatedDrivers });
        return { trips: updatedTrips, vehicles: updatedVehicles, drivers: updatedDrivers };
      });
      get().addActivity("trip", `Trip ${id} cancelled. Vehicle & driver released.`);
      return { success: true };
    },

    addMaintenanceLog: (log) => {
      const newLog: MaintenanceLog = {
        ...log,
        id: `m${Date.now()}`
      };

      set((state) => {
        const updatedLogs = [...state.maintenanceLogs, newLog];
        
        // Creating an active maintenance record automatically changes vehicle status to In Shop
        let updatedVehicles = state.vehicles;
        if (log.status === "Active") {
          updatedVehicles = state.vehicles.map((v) =>
            v.id === log.vehicleId ? { ...v, status: "In Shop" as VehicleStatus } : v
          );
        }

        saveState({ maintenanceLogs: updatedLogs, vehicles: updatedVehicles });
        return { maintenanceLogs: updatedLogs, vehicles: updatedVehicles };
      });
      const vehicle = get().vehicles.find((v) => v.id === log.vehicleId);
      get().addActivity("maintenance", `Vehicle ${vehicle ? vehicle.model : "Vehicle"} put into maintenance shop (${log.description}).`);
    },

    closeMaintenanceLog: (id) => {
      const logToClose = get().maintenanceLogs.find((l) => l.id === id);
      const vehicle = logToClose ? get().vehicles.find((v) => v.id === logToClose.vehicleId) : null;

      set((state) => {
        const logToCloseObj = state.maintenanceLogs.find((l) => l.id === id);
        if (!logToCloseObj) return {};

        const updatedLogs = state.maintenanceLogs.map((l) =>
          l.id === id ? { ...l, status: "Closed" as const } : l
        );

        // Closing maintenance restores vehicle to Available (unless retired)
        const updatedVehicles = state.vehicles.map((v) =>
          v.id === logToCloseObj.vehicleId && v.status === "In Shop"
            ? { ...v, status: "Available" as VehicleStatus }
            : v
        );

        saveState({ maintenanceLogs: updatedLogs, vehicles: updatedVehicles });
        return { maintenanceLogs: updatedLogs, vehicles: updatedVehicles };
      });
      get().addActivity("maintenance", `Vehicle ${vehicle ? vehicle.model : "Vehicle"} released from maintenance shop.`);
    },

    addFuelLog: (log) => {
      const newLog: FuelLog = {
        ...log,
        id: `f${Date.now()}`
      };
      set((state) => {
        const updated = [...state.fuelLogs, newLog];
        saveState({ fuelLogs: updated });
        return { fuelLogs: updated };
      });
      const vehicle = get().vehicles.find((v) => v.id === log.vehicleId);
      get().addActivity("expense", `Fuel purchase log of ₹${log.cost.toLocaleString()} logged for ${vehicle ? vehicle.model : "Vehicle"}.`);
    },

    addExpense: (expense) => {
      const newExpense: Expense = {
        ...expense,
        id: `e${Date.now()}`
      };
      set((state) => {
        const updated = [...state.expenses, newExpense];
        saveState({ expenses: updated });
        return { expenses: updated };
      });
      const vehicle = get().vehicles.find((v) => v.id === expense.vehicleId);
      get().addActivity("expense", `Expense of ₹${expense.amount.toLocaleString()} (${expense.description}) logged for ${vehicle ? vehicle.model : "Vehicle"}.`);
    },

    updateSettings: (settings) => {
      set({ settings });
      saveState({ settings });
    },

    clearNotifications: () => {
      set({ notifications: [] });
      saveState({ notifications: [] });
    },

    resetAllData: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      set({
        currentUser: PREDEFINED_USERS["driver@transitops.in"],
        vehicles: SEED_VEHICLES,
        drivers: SEED_DRIVERS,
        trips: SEED_TRIPS,
        maintenanceLogs: SEED_MAINTENANCE,
        fuelLogs: SEED_FUEL,
        expenses: SEED_EXPENSES,
        settings: {
          depotName: "Gandhinagar Depot GJ14",
          currency: "INR (Rs)",
          distanceUnit: "Kilometers"
        },
        notifications: SEED_NOTIFICATIONS,
        activities: SEED_ACTIVITIES
      });
    }
  };
});

export function getPermission(role: Role, module: 'fleet' | 'drivers' | 'trips' | 'maintenance' | 'fuelExp' | 'analytics'): 'write' | 'view' | 'none' {
  const matrix: Record<Role, Record<string, 'write' | 'view' | 'none'>> = {
    FLEET_MANAGER: {
      fleet: 'write',
      drivers: 'write',
      trips: 'none',
      maintenance: 'write',
      fuelExp: 'none',
      analytics: 'write'
    },
    DRIVER: {
      fleet: 'view',
      drivers: 'none',
      trips: 'write',
      maintenance: 'none',
      fuelExp: 'none',
      analytics: 'none'
    },
    SAFETY_OFFICER: {
      fleet: 'none',
      drivers: 'write',
      trips: 'view',
      maintenance: 'none',
      fuelExp: 'none',
      analytics: 'none'
    },
    FINANCIAL_ANALYST: {
      fleet: 'view',
      drivers: 'none',
      trips: 'none',
      maintenance: 'none',
      fuelExp: 'write',
      analytics: 'write'
    }
  };
  return matrix[role][module];
}

export function isLicenseExpired(expiryStr: string): boolean {
  if (!expiryStr) return false;
  // If it contains "EXPIRED", it is immediately expired
  if (expiryStr.toUpperCase().includes("EXPIRED")) return true;
  
  const parts = expiryStr.trim().split("/");
  if (parts.length < 2) return false;
  
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  if (isNaN(month) || isNaN(year)) return false;
  
  // Current system date is July 2026
  const CURRENT_YEAR = 2026;
  const CURRENT_MONTH = 7;
  
  if (year < CURRENT_YEAR) return true;
  if (year === CURRENT_YEAR && month < CURRENT_MONTH) return true;
  
  return false;
}