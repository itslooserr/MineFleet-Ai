/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HaulTruck, LoadingPoint, UnloadingPoint } from '../types/mining';
import { Truck, Search, User, MapPin } from 'lucide-react';

interface FleetManagerTableProps {
  trucks: HaulTruck[];
  loadingPoints: LoadingPoint[];
  unloadingPoints: UnloadingPoint[];
  selectedTruckId: string | null;
  onSelectTruck: (truckId: string | null) => void;
  onToggleTruckMaintenance: (truckId: string) => void;
  onForceReroute: (truckId: string) => void;
  onFleetSizeChange?: (size: number) => void;
}

export const FleetManagerTable: React.FC<FleetManagerTableProps> = ({
  trucks,
  loadingPoints,
  unloadingPoints,
  selectedTruckId,
  onSelectTruck,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredTrucks = trucks.filter((t) => {
    const matchesSearch =
      t.truckNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName.toLowerCase().includes(search.toLowerCase()) ||
      t.model.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'LOADED') return t.currentPayloadTons > 0;
    if (statusFilter === 'EMPTY') return t.currentPayloadTons === 0;
    if (statusFilter === 'QUEUED') return t.status.startsWith('QUEUED');
    if (statusFilter === 'MOVING') return t.status.startsWith('TRAVELING');

    return true;
  });

  const getDestinationName = (t: HaulTruck) => {
    if (t.status === 'TRAVELING_EMPTY' || t.status === 'QUEUED_LOADING' || t.status === 'LOADING') {
      const load = loadingPoints.find((l) => l.id === t.assignedLoadingPointId);
      return load ? `${load.name} (${load.benchLevel})` : 'Loading Shovel';
    } else {
      const unload = unloadingPoints.find((u) => u.id === t.assignedUnloadingPointId);
      return unload ? unload.name : 'Unloading Facility';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900">
            MineFleet Directory (24 Dump Trucks)
          </h3>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredTrucks.length} of {trucks.length} Active Vehicles
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search driver name, truck ID, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          {[
            { id: 'ALL', label: 'All 24 Trucks' },
            { id: 'MOVING', label: 'In Transit' },
            { id: 'LOADED', label: 'Carrying Load' },
            { id: 'EMPTY', label: 'Empty' },
            { id: 'QUEUED', label: 'In Queue' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 font-medium ${
                statusFilter === f.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-mono text-[11px]">
              <th className="py-3 px-4">Gadi No. (Truck ID)</th>
              <th className="py-3 px-4">Driver Kon Hai</th>
              <th className="py-3 px-4">Kya Load Hai</th>
              <th className="py-3 px-4">Kaha Jayega (Destination)</th>
              <th className="py-3 px-4">Speed</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Map View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredTrucks.map((truck) => {
              const isSelected = truck.id === selectedTruckId;
              const isLoaded = truck.currentPayloadTons > 0;

              return (
                <tr
                  key={truck.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-sky-50/70' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-sky-700">{truck.truckNumber}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{truck.model}</div>
                  </td>

                  <td className="py-3 px-4 font-sans">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{truck.driverName}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {isLoaded ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {truck.currentPayloadTons} Tonnes Ore
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Empty (0 Tonnes)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-sans">
                    <div className="flex items-center gap-1 text-slate-800 max-w-xs truncate font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{getDestinationName(truck)}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {truck.currentSpeedKmh} km/h
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-600 font-sans">
                      {truck.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectTruck(isSelected ? null : truck.id)}
                      className={`px-3 py-1 rounded-md text-xs transition-colors font-medium ${
                        isSelected
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Locate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
