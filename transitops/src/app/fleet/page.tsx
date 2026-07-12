"use client";

import React, { useState } from "react";
import { useTransitStore, VehicleStatus, getPermission, Vehicle } from "@/lib/store";
import { Plus, Search, AlertTriangle, X, FolderOpen, FileText, Upload, Calendar, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function Fleet() {
  const { vehicles, addVehicle, updateVehicle, currentUser, fuelLogs, maintenanceLogs, uploadVehicleDocument, deleteVehicle } = useTransitStore();
  const writeAccess = currentUser ? getPermission(currentUser.role, "fleet") === "write" : false;
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("model");
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [regNumber, setRegNumber] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<"Van" | "Truck" | "Mini">("Van");
  const [capacity, setCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editRegNumber, setEditRegNumber] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editType, setEditType] = useState<"Van" | "Truck" | "Mini">("Van");
  const [editCapacity, setEditCapacity] = useState("");
  const [editOdometer, setEditOdometer] = useState("");
  const [editAcquisitionCost, setEditAcquisitionCost] = useState("");

  // Document Management Modal State
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDocVehicle, setSelectedDocVehicle] = useState<Vehicle | null>(null);
  const [docName, setDocName] = useState("");
  const [docFileName, setDocFileName] = useState("");
  const [docExpiry, setDocExpiry] = useState("");
  const [docStatus, setDocStatus] = useState<"Active" | "Expired">("Active");

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

  const handleEditVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editRegNumber || !editModel || !editCapacity || !editOdometer || !editAcquisitionCost) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        regNumber: editRegNumber.toUpperCase().replace(/\s+/g, ""),
        model: editModel,
        type: editType,
        capacity: Number(editCapacity),
        odometer: Number(editOdometer),
        acquisitionCost: Number(editAcquisitionCost),
      });
      toast.success("Vehicle properties updated successfully!");
      setShowEditModal(false);
      setEditingVehicle(null);
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

  // Sorted vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortBy === "model") return a.model.localeCompare(b.model);
    if (sortBy === "odometer") return b.odometer - a.odometer;
    if (sortBy === "capacity") return b.capacity - a.capacity;
    if (sortBy === "acquisitionCost") return b.acquisitionCost - a.acquisitionCost;
    return 0;
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

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="model">Sort by Model</option>
            <option value="odometer">Sort by Odometer (High-Low)</option>
            <option value="capacity">Sort by Capacity (High-Low)</option>
            <option value="acquisitionCost">Sort by Acq. Cost (High-Low)</option>
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
                <th className="px-6 py-3.5">Op. Cost (₹)</th>
                <th className="px-6 py-3.5 text-center">Docs</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
              {sortedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    No vehicles found matching the filters
                  </td>
                </tr>
              ) : (
                sortedVehicles.map((v) => {
                  const vFuel = (fuelLogs || []).filter(l => l.vehicleId === v.id).reduce((acc, l) => acc + l.cost, 0);
                  const vMaint = (maintenanceLogs || []).filter(l => l.vehicleId === v.id).reduce((acc, l) => acc + l.cost, 0);
                  const totalOpCost = vFuel + vMaint;
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white uppercase">{v.regNumber}</td>
                      <td className="px-6 py-4 font-semibold">{v.model}</td>
                      <td className="px-6 py-4">{v.type}</td>
                      <td className="px-6 py-4">{v.capacity >= 1000 ? `${v.capacity / 1000} Ton` : `${v.capacity} kg`}</td>
                      <td className="px-6 py-4 font-mono">{v.odometer.toLocaleString()} km</td>
                      <td className="px-6 py-4 font-mono">₹{v.acquisitionCost.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-amber-600 dark:text-amber-500 font-bold">₹{totalOpCost.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedDocVehicle(v);
                            setShowDocModal(true);
                          }}
                          className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FolderOpen size={12} className="text-blue-500" />
                          <span>Docs ({v.documents?.length || 0})</span>
                        </button>
                      </td>
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
                      <td className="px-6 py-4 text-center">
                        {writeAccess ? (
                          <div className="flex justify-center items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingVehicle(v);
                                setEditRegNumber(v.regNumber);
                                setEditModel(v.model);
                                setEditType(v.type);
                                setEditCapacity(String(v.capacity));
                                setEditOdometer(String(v.odometer));
                                setEditAcquisitionCost(String(v.acquisitionCost));
                                setShowEditModal(true);
                              }}
                              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Vehicle Properties"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete vehicle ${v.model} (${v.regNumber})?`)) {
                                  deleteVehicle(v.id);
                                  toast.success(`Vehicle ${v.model} deleted.`);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1.5 rounded-md hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Vehicle"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-[10px]">—</span>
                        )}
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
                    onChange={(e) => setType(e.target.value as "Van" | "Truck" | "Mini")}
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
      {/* VEHICLE DOCUMENTS MODAL */}
      {showDocModal && selectedDocVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Document Manager — {selectedDocVehicle.model}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">REG NO: {selectedDocVehicle.regNumber}</p>
              </div>
              <button onClick={() => {
                setShowDocModal(false);
                setDocName("");
                setDocFileName("");
                setDocExpiry("");
              }} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document List */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Registered Documents</h4>
                <div className="space-y-3">
                  {(!selectedDocVehicle.documents || selectedDocVehicle.documents.length === 0) ? (
                    <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                      <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                      <span>No documents registered yet.</span>
                    </div>
                  ) : (
                    selectedDocVehicle.documents.map((doc) => (
                      <div key={doc.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3">
                        <FileText className="w-8 h-8 text-blue-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{doc.fileName}</p>
                          <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                            <Calendar size={10} />
                            <span>Expires: {doc.expiryDate}</span>
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border shrink-0 ${
                          doc.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 border-red-500/20"
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upload Document Form */}
              <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-fit">
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1">
                  <Upload size={13} className="text-blue-500" />
                  <span>Upload Simulated Document</span>
                </h4>
                {writeAccess ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!docName || !docFileName || !docExpiry) {
                      toast.error("Please fill in all document fields.");
                      return;
                    }
                    uploadVehicleDocument(selectedDocVehicle.id, {
                      name: docName,
                      fileName: docFileName,
                      expiryDate: docExpiry,
                      status: docStatus
                    });
                    toast.success(`Document '${docName}' uploaded successfully!`);
                    
                    // Live state update on the local variable as well
                    const updatedDocs = [...(selectedDocVehicle.documents || []), {
                      id: `doc_${Date.now()}`,
                      name: docName,
                      fileName: docFileName,
                      expiryDate: docExpiry,
                      status: docStatus
                    }];
                    setSelectedDocVehicle({
                      ...selectedDocVehicle,
                      documents: updatedDocs
                    });

                    // Reset form
                    setDocName("");
                    setDocFileName("");
                    setDocExpiry("");
                  }} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Document Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Road Permit, Insurance"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Simulated File Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. policy_2026.pdf"
                        value={docFileName}
                        onChange={(e) => setDocFileName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YYYY"
                          value={docExpiry}
                          onChange={(e) => setDocExpiry(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Status
                        </label>
                        <select
                          value={docStatus}
                          onChange={(e) => setDocStatus(e.target.value as "Active" | "Expired")}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none"
                        >
                          <option value="Active">Active</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-3 cursor-pointer"
                    >
                      <Upload size={12} />
                      <span>Upload Document</span>
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl leading-relaxed">
                    <span>Only Fleet Managers have write permissions to upload documents.</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDocModal(false);
                  setDocName("");
                  setDocFileName("");
                  setDocExpiry("");
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VEHICLE DIALOG MODAL */}
      {showEditModal && editingVehicle && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Edit Vehicle Details</h3>
              <button onClick={() => {
                setShowEditModal(false);
                setEditingVehicle(null);
              }} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditVehicleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Registration No (Unique)
                  </label>
                  <input
                    type="text"
                    value={editRegNumber}
                    onChange={(e) => setEditRegNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as "Van" | "Truck" | "Mini")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none"
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
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
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
                    value={editOdometer}
                    onChange={(e) => setEditOdometer(e.target.value)}
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
                    value={editAcquisitionCost}
                    onChange={(e) => setEditAcquisitionCost(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingVehicle(null);
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
