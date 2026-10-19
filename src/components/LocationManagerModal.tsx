/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LoadingPoint, UnloadingPoint, MaterialType, ShovelType } from '../types/mining';
import { X, MapPin } from 'lucide-react';

interface LocationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  loadingPoints: LoadingPoint[];
  unloadingPoints: UnloadingPoint[];
  onUpdateLoadingPoint: (updated: LoadingPoint) => void;
  onUpdateUnloadingPoint: (updated: UnloadingPoint) => void;
  onAddLoadingPoint: (newPoint: LoadingPoint) => void;
}

export const LocationManagerModal: React.FC<LocationManagerModalProps> = ({
  isOpen,
  onClose,
  loadingPoints,
  unloadingPoints,
  onUpdateLoadingPoint,
  onUpdateUnloadingPoint,
  onAddLoadingPoint,
}) => {
  const [activeTab, setActiveTab] = useState<'loading' | 'unloading' | 'create'>('loading');

  const [newShovelName, setNewShovelName] = useState('Shovel 7 (West Cut)');
  const [newShovelCode, setNewShovelCode] = useState('SH-07');
  const [newBench, setNewBench] = useState('-100m Pushback');
  const [newMaterial, setNewMaterial] = useState<MaterialType>('HIGH_GRADE_COPPER');
  const [newShovelType, setNewShovelType] = useState<ShovelType>('HYDRAULIC_SHOVEL');
  const [newRateTph, setNewRateTph] = useState(1300);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPoint: LoadingPoint = {
      id: `load_${Date.now()}`,
      name: newShovelName,
      code: newShovelCode,
      benchLevel: newBench,
      elevationM: -100,
      material: newMaterial,
      shovelType: newShovelType,
      x: 340 + Math.floor(Math.random() * 300),
      y: 330 + Math.floor(Math.random() * 100),
      loadingRateTph: Number(newRateTph),
      loadTimeSec: Math.round((240 / Number(newRateTph)) * 3600 * 0.7),
      currentTruckId: null,
      queue: [],
      maxQueueCapacity: 5,
      status: 'OPERATIONAL',
      totalLoadedTonnage: 0,
      starvationTimeSec: 0,
      totalOperationalTimeSec: 0,
    };
    onAddLoadingPoint(newPoint);
    setActiveTab('loading');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Mine Location & Target Point Manager
              </h2>
              <p className="text-xs text-slate-500">
                Configure 6 loading shovels, 7 unloading facilities, and production cycle rates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-100 bg-white text-xs">
          <button
            onClick={() => setActiveTab('loading')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
              activeTab === 'loading'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Loading Points ({loadingPoints.length} Shovels)
          </button>
          <button
            onClick={() => setActiveTab('unloading')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
              activeTab === 'unloading'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Unloading Destinations ({unloadingPoints.length} Facilities)
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 ${
              activeTab === 'create'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            + Add New Pit Shovel
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3">
          {activeTab === 'loading' && (
            <div className="space-y-2.5">
              {loadingPoints.map((load) => (
                <div
                  key={load.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-sm">{load.code}</span>
                      <span className="font-semibold text-slate-800">{load.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                        {load.benchLevel}
                      </span>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2">
                      <span>Rate: {load.loadingRateTph} T/h</span>
                      <span>·</span>
                      <span>Load Time: {load.loadTimeSec}s</span>
                      <span>·</span>
                      <span className="text-amber-800 font-semibold">{load.material.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <button
                      onClick={() =>
                        onUpdateLoadingPoint({
                          ...load,
                          status: load.status === 'OPERATIONAL' ? 'BREAKDOWN' : 'OPERATIONAL',
                        })
                      }
                      className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                        load.status === 'OPERATIONAL'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-800'
                          : 'bg-red-100 text-red-800 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      {load.status === 'OPERATIONAL' ? 'Active (Break)' : 'Broken (Fix)'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'unloading' && (
            <div className="space-y-2.5">
              {unloadingPoints.map((unload) => (
                <div
                  key={unload.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-800 font-mono text-sm">{unload.code}</span>
                      <span className="font-semibold text-slate-900">{unload.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                        {unload.type}
                      </span>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2">
                      <span>Dump Cycle: {unload.dumpTimeSec}s</span>
                      <span>·</span>
                      <span>Parallel Pockets: {unload.maxSimultaneousDumps}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <button
                      onClick={() =>
                        onUpdateUnloadingPoint({
                          ...unload,
                          status: unload.status === 'OPERATIONAL' ? 'CONGESTED' : 'OPERATIONAL',
                        })
                      }
                      className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                        unload.status === 'OPERATIONAL'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-orange-100'
                          : 'bg-orange-100 text-orange-800 hover:bg-emerald-100'
                      }`}
                    >
                      {unload.status === 'OPERATIONAL' ? 'Nominal Flow' : 'Congested / Slow'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Shovel Display Name</label>
                  <input
                    type="text"
                    value={newShovelName}
                    onChange={(e) => setNewShovelName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Equipment Code Tag</label>
                  <input
                    type="text"
                    value={newShovelCode}
                    onChange={(e) => setNewShovelCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Bench Level</label>
                  <input
                    type="text"
                    value={newBench}
                    onChange={(e) => setNewBench(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Loading Rate (T/hr)</label>
                  <input
                    type="number"
                    value={newRateTph}
                    onChange={(e) => setNewRateTph(Number(e.target.value))}
                    min={500}
                    max={3000}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('loading')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors"
                >
                  Deploy Shovel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
