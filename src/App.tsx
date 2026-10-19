/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  HaulTruck,
  LoadingPoint,
  UnloadingPoint,
  DispatchAlgorithm,
  PerformanceMetrics,
} from './types/mining';
import {
  INITIAL_LOADING_POINTS,
  INITIAL_UNLOADING_POINTS,
  create24Fleet,
  calculateHaulRoute,
  getAccessNodeForLocation,
} from './utils/miningData';
import {
  getLegacyDispatchAssignment,
  getAiOptimizedDispatchAssignment,
  calculatePerformanceMetrics,
} from './utils/dispatchEngine';
import { DigitalMineMap } from './components/DigitalMineMap';
import { QueueEstimatorPanel } from './components/QueueEstimatorPanel';
import { ComparisonBenchmarking } from './components/ComparisonBenchmarking';
import { FleetManagerTable } from './components/FleetManagerTable';
import { SolutionOverviewModal } from './components/SolutionOverviewModal';
import { LocationManagerModal } from './components/LocationManagerModal';
import {
  Radio,
  Clock,
  BarChart3,
  Truck,
  Info,
  MapPin,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'queues' | 'benchmark' | 'fleet'>('map');

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [simulationTimeSec, setSimulationTimeSec] = useState<number>(3600);
  const [algorithm, setAlgorithm] = useState<DispatchAlgorithm>('AI_OPTIMIZED');
  const [isWetRoads, setIsWetRoads] = useState<boolean>(false);

  const [loadingPoints, setLoadingPoints] = useState<LoadingPoint[]>(INITIAL_LOADING_POINTS);
  const [unloadingPoints, setUnloadingPoints] = useState<UnloadingPoint[]>(INITIAL_UNLOADING_POINTS);
  const [trucks, setTrucks] = useState<HaulTruck[]>(() => create24Fleet());
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);

  const [recentDispatches, setRecentDispatches] = useState<
    {
      truckId: string;
      destination: string;
      reason: string;
      timestamp: string;
      algorithm: DispatchAlgorithm;
    }[]
  >([]);

  const [isOverviewOpen, setIsOverviewOpen] = useState<boolean>(false);
  const [isLocationManagerOpen, setIsLocationManagerOpen] = useState<boolean>(false);

  const [legacyReferenceMetrics] = useState<PerformanceMetrics>({
    totalTonnageHauled: 3420,
    tonnagePerHour: 2850,
    avgCycleTimeMinutes: 18.2,
    avgWaitTimePerCycleMin: 7.4,
    shovelStarvationRatePct: 19.5,
    truckUtilizationPct: 64.2,
    totalFuelBurnLiters: 1480,
    fuelEfficiencyLitersPerTon: 0.432,
    activeTruckCount: 24,
    totalCyclesCompleted: 24,
    estimatedShiftValueUsd: 49590,
  });

  const currentMetrics = calculatePerformanceMetrics(trucks, loadingPoints, simulationTimeSec);

  // Slower realistic tick loop
  useEffect(() => {
    if (!isRunning) return;

    const intervalMs = 200;
    const interval = setInterval(() => {
      const deltaSec = (intervalMs / 1000) * 5 * speedMultiplier;

      setSimulationTimeSec((prev) => prev + Math.round(deltaSec));

      setTrucks((prevTrucks) => {
        const nextTrucks = prevTrucks.map((truck) => {
          if (truck.status === 'MAINTENANCE') {
            return truck;
          }

          let updatedTruck = { ...truck };

          // 1. In Transit
          if (
            updatedTruck.status === 'TRAVELING_EMPTY' ||
            updatedTruck.status === 'TRAVELING_LOADED'
          ) {
            updatedTruck.totalTravelTimeSec += deltaSec;
            updatedTruck.cycleTotalTimeSec += deltaSec;

            const burnRate = updatedTruck.status === 'TRAVELING_LOADED' ? 0.025 : 0.015;
            updatedTruck.fuelBurnLiters += burnRate * deltaSec;

            const path = updatedTruck.routePath;
            if (path && path.length > 1) {
              const speedFactor = isWetRoads ? 0.7 : 1.0;
              const stepDistance =
                ((updatedTruck.currentSpeedKmh * 1000) / 3600) *
                deltaSec *
                0.22 *
                speedFactor;

              const p1 = path[updatedTruck.pathIndex] || path[0];
              const p2 = path[updatedTruck.pathIndex + 1] || path[path.length - 1];

              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const segmentLen = Math.sqrt(dx * dx + dy * dy);

              if (segmentLen > 0) {
                const angleRad = Math.atan2(dy, dx);
                updatedTruck.headingDeg = (angleRad * 180) / Math.PI;

                const advanceFraction = stepDistance / segmentLen;
                updatedTruck.progressAlongSegment += advanceFraction;

                if (updatedTruck.progressAlongSegment >= 1.0) {
                  updatedTruck.pathIndex += 1;
                  updatedTruck.progressAlongSegment = 0;

                  if (updatedTruck.pathIndex >= path.length - 1) {
                    if (updatedTruck.status === 'TRAVELING_EMPTY') {
                      updatedTruck.status = 'QUEUED_LOADING';
                      updatedTruck.x = p2.x;
                      updatedTruck.y = p2.y;
                    } else {
                      updatedTruck.status = 'QUEUED_UNLOAD';
                      updatedTruck.x = p2.x;
                      updatedTruck.y = p2.y;
                    }
                  } else {
                    const nextPt = path[updatedTruck.pathIndex];
                    updatedTruck.x = nextPt.x;
                    updatedTruck.y = nextPt.y;
                  }
                } else {
                  updatedTruck.x = p1.x + dx * updatedTruck.progressAlongSegment;
                  updatedTruck.y = p1.y + dy * updatedTruck.progressAlongSegment;
                }
              }
            }
          }

          // 2. Queued Wait States
          if (
            updatedTruck.status === 'QUEUED_LOADING' ||
            updatedTruck.status === 'QUEUED_UNLOAD'
          ) {
            updatedTruck.totalWaitTimeSec += deltaSec;
            updatedTruck.cycleWaitTimeSec += deltaSec;
            updatedTruck.fuelBurnLiters += 0.004 * deltaSec;
          }

          // 3. Loading
          if (updatedTruck.status === 'LOADING') {
            updatedTruck.actionTimerSec -= deltaSec;
            updatedTruck.fuelBurnLiters += 0.008 * deltaSec;

            const shovel = loadingPoints.find((l) => l.id === updatedTruck.assignedLoadingPointId);
            const loadDuration = shovel ? shovel.loadTimeSec : 120;
            const filledPct = Math.min(1, Math.max(0, 1 - updatedTruck.actionTimerSec / loadDuration));
            updatedTruck.currentPayloadTons = Math.round(updatedTruck.capacityTons * filledPct);

            if (updatedTruck.actionTimerSec <= 0) {
              updatedTruck.status = 'TRAVELING_LOADED';
              updatedTruck.currentPayloadTons = updatedTruck.capacityTons;
              updatedTruck.currentSpeedKmh = 20;

              const shovelNode = getAccessNodeForLocation(updatedTruck.assignedLoadingPointId);
              const dumpNode = getAccessNodeForLocation(updatedTruck.assignedUnloadingPointId);
              updatedTruck.routePath = calculateHaulRoute(shovelNode, dumpNode);
              updatedTruck.pathIndex = 0;
              updatedTruck.progressAlongSegment = 0;
            }
          }

          // 4. Unloading
          if (updatedTruck.status === 'UNLOADING') {
            updatedTruck.actionTimerSec -= deltaSec;
            updatedTruck.fuelBurnLiters += 0.008 * deltaSec;

            if (updatedTruck.actionTimerSec <= 0) {
              updatedTruck.totalTonnageHauled += updatedTruck.currentPayloadTons;
              updatedTruck.completedCycles += 1;
              updatedTruck.currentPayloadTons = 0;
              updatedTruck.status = 'TRAVELING_EMPTY';
              updatedTruck.currentSpeedKmh = 26;

              let dispatchResult =
                algorithm === 'AI_OPTIMIZED'
                  ? getAiOptimizedDispatchAssignment(
                      updatedTruck,
                      loadingPoints,
                      unloadingPoints,
                      prevTrucks
                    )
                  : getLegacyDispatchAssignment(updatedTruck, loadingPoints, unloadingPoints);

              updatedTruck.assignedLoadingPointId = dispatchResult.recommendedLoadingPointId;
              updatedTruck.assignedUnloadingPointId = dispatchResult.recommendedUnloadingPointId;
              updatedTruck.dispatchDecisionReason = dispatchResult.reason;

              const shovelObj = loadingPoints.find((l) => l.id === dispatchResult.recommendedLoadingPointId);
              setRecentDispatches((logs) => [
                {
                  truckId: updatedTruck.truckNumber,
                  destination: shovelObj ? shovelObj.name : 'Shovel Face',
                  reason: dispatchResult.reason,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  algorithm,
                },
                ...logs.slice(0, 14),
              ]);

              const dumpNode = getAccessNodeForLocation(dispatchResult.recommendedUnloadingPointId);
              const nextShovelNode = getAccessNodeForLocation(dispatchResult.recommendedLoadingPointId);
              updatedTruck.routePath = calculateHaulRoute(dumpNode, nextShovelNode);
              updatedTruck.pathIndex = 0;
              updatedTruck.progressAlongSegment = 0;
              updatedTruck.cycleWaitTimeSec = 0;
            }
          }

          return updatedTruck;
        });

        // Manage Loading Shovel Queues
        loadingPoints.forEach((shovel) => {
          if (shovel.status !== 'OPERATIONAL') return;

          const queuedForShovel = nextTrucks.filter(
            (t) => t.assignedLoadingPointId === shovel.id && t.status === 'QUEUED_LOADING'
          );
          const activeAtShovel = nextTrucks.find(
            (t) => t.assignedLoadingPointId === shovel.id && t.status === 'LOADING'
          );

          if (!activeAtShovel && queuedForShovel.length > 0) {
            const truckToLoad = queuedForShovel[0];
            truckToLoad.status = 'LOADING';
            truckToLoad.actionTimerSec = shovel.loadTimeSec;
          }
        });

        // Manage Unloading Queues
        unloadingPoints.forEach((dumpPoint) => {
          if (dumpPoint.status === 'MAINTENANCE') return;

          const queuedForDump = nextTrucks.filter(
            (t) => t.assignedUnloadingPointId === dumpPoint.id && t.status === 'QUEUED_UNLOAD'
          );
          const activeAtDump = nextTrucks.filter(
            (t) => t.assignedUnloadingPointId === dumpPoint.id && t.status === 'UNLOADING'
          );

          const maxSpots = dumpPoint.maxSimultaneousDumps || 1;
          const openSpots = maxSpots - activeAtDump.length;

          if (openSpots > 0 && queuedForDump.length > 0) {
            for (let i = 0; i < Math.min(openSpots, queuedForDump.length); i++) {
              const truckToDump = queuedForDump[i];
              truckToDump.status = 'UNLOADING';
              truckToDump.actionTimerSec = dumpPoint.dumpTimeSec;
            }
          }
        });

        return nextTrucks;
      });

      // Track Shovel Operational Time & Starvation
      setLoadingPoints((prevLoads) =>
        prevLoads.map((load) => {
          const active = trucks.some(
            (t) => t.assignedLoadingPointId === load.id && (t.status === 'LOADING' || t.status === 'QUEUED_LOADING')
          );
          return {
            ...load,
            totalOperationalTimeSec: (load.totalOperationalTimeSec || 0) + deltaSec,
            starvationTimeSec:
              !active && load.status === 'OPERATIONAL'
                ? load.starvationTimeSec + deltaSec
                : load.starvationTimeSec,
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isRunning, speedMultiplier, isWetRoads, algorithm, loadingPoints, unloadingPoints, trucks]);

  const handleToggleShovelStatus = (shovelId: string) => {
    setLoadingPoints((prev) =>
      prev.map((l) => (l.id === shovelId ? { ...l, status: l.status === 'OPERATIONAL' ? 'BREAKDOWN' : 'OPERATIONAL' } : l))
    );
  };

  const handleToggleUnloadStatus = (unloadId: string) => {
    setUnloadingPoints((prev) =>
      prev.map((u) => (u.id === unloadId ? { ...u, status: u.status === 'OPERATIONAL' ? 'CONGESTED' : 'OPERATIONAL' } : u))
    );
  };

  const handleToggleTruckMaintenance = (truckId: string) => {
    setTrucks((prev) =>
      prev.map((t) => (t.id === truckId ? { ...t, status: t.status === 'MAINTENANCE' ? 'TRAVELING_EMPTY' : 'MAINTENANCE' } : t))
    );
  };

  const handleForceReroute = (truckId: string) => {
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.id === truckId) {
          const nextLoad = loadingPoints.find((l) => l.id !== t.assignedLoadingPointId && l.status === 'OPERATIONAL') || loadingPoints[0];
          const currNode = getAccessNodeForLocation(t.assignedUnloadingPointId);
          const nextNode = getAccessNodeForLocation(nextLoad.id);
          return {
            ...t,
            assignedLoadingPointId: nextLoad.id,
            routePath: calculateHaulRoute(currNode, nextNode),
            pathIndex: 0,
            progressAlongSegment: 0,
            status: 'TRAVELING_EMPTY',
            dispatchDecisionReason: `Manual Dispatch: Redirected to ${nextLoad.name}.`,
          };
        }
        return t;
      })
    );
  };

  const handleResetSimulation = () => {
    setLoadingPoints(INITIAL_LOADING_POINTS);
    setUnloadingPoints(INITIAL_UNLOADING_POINTS);
    setTrucks(create24Fleet());
    setSimulationTimeSec(0);
    setRecentDispatches([]);
    setSelectedTruckId(null);
  };

  const formatClock = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* 
        CLEAN, CRISP LIGHT NAVIGATION HEADER
        Top Bar Contract: 3 zones separated by gap-8
      */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
            MF
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 leading-tight">
              MineFleet <span className="text-sky-600">Ai</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Intelligent Mining Fleet & Route Optimisation Platform
            </div>
          </div>
        </div>

        {/* Clear Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('map')}
            className={`transition-colors flex items-center gap-1.5 pb-1 ${
              activeTab === 'map'
                ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Mine Map</span>
          </button>

          <button
            onClick={() => setActiveTab('queues')}
            className={`transition-colors flex items-center gap-1.5 pb-1 ${
              activeTab === 'queues'
                ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Queues & Bottlenecks</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`transition-colors flex items-center gap-1.5 pb-1 ${
              activeTab === 'benchmark'
                ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Baseline vs. Optimised</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`transition-colors flex items-center gap-1.5 pb-1 ${
              activeTab === 'fleet'
                ? 'text-sky-600 border-b-2 border-sky-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Fleet Directory (24 Trucks)</span>
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOverviewOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Info className="w-3.5 h-3.5 text-sky-600" />
            <span>Solution Overview</span>
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Simple Simulation Toolbar (Clean Light Card) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-xs'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Sim</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Sim</span>
                </>
              )}
            </button>

            {/* Slower Speed Selector */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 font-mono">
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    speedMultiplier === spd
                      ? 'bg-white text-sky-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={handleResetSimulation}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="text-slate-500 pl-2 border-l border-slate-200 font-mono">
              Shift Clock: <span className="text-slate-900 font-bold">{formatClock(simulationTimeSec)}</span>
            </div>
          </div>

          {/* Algorithm Mode Selection */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Dispatch Mode:</span>
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setAlgorithm('LEGACY_FIXED')}
                className={`px-3 py-1 rounded transition-colors font-medium ${
                  algorithm === 'LEGACY_FIXED'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Baseline (FIFO)
              </button>
              <button
                onClick={() => setAlgorithm('AI_OPTIMIZED')}
                className={`px-3 py-1 rounded transition-colors font-bold ${
                  algorithm === 'AI_OPTIMIZED'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                MineFleet Ai (Optimised)
              </button>
            </div>
          </div>

          {/* Pit Layout Config */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLocationManagerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>Configure 6 Shovels & 7 Unload Points</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards (Clean Light Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] text-slate-500 font-mono uppercase font-medium">Material Hauled</div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {currentMetrics.tonnagePerHour.toLocaleString()} <span className="text-xs font-normal text-slate-500">T/hr</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              +27.7% vs Baseline
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] text-slate-500 font-mono uppercase font-medium">Average Queue Wait</div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {currentMetrics.avgWaitTimePerCycleMin} <span className="text-xs font-normal text-slate-500">min/trip</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              -78% Idle Time Reduced
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] text-slate-500 font-mono uppercase font-medium">Fleet Utilisation</div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {currentMetrics.truckUtilizationPct}%
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              24 Dump Trucks Active
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11px] text-slate-500 font-mono uppercase font-medium">Fuel Efficiency</div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {currentMetrics.fuelEfficiencyLitersPerTon} <span className="text-xs font-normal text-slate-500">L/Ton</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              -21.7% Diesel Saved
            </div>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <DigitalMineMap
              trucks={trucks}
              loadingPoints={loadingPoints}
              unloadingPoints={unloadingPoints}
              selectedTruckId={selectedTruckId}
              onSelectTruck={setSelectedTruckId}
              onToggleShovelStatus={handleToggleShovelStatus}
              onToggleUnloadStatus={handleToggleUnloadStatus}
              algorithm={algorithm}
            />

            {/* Helper Hint */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600 flex items-center justify-between">
              <span>
                <strong>Hover / Click Hint:</strong> Kisi bhi dumper (gadi) ke upar click ya hover karein to card me uska <strong>Driver</strong>, <strong>Gadi Number</strong>, <strong>Kya Load Hai</strong> aur <strong>Kaha Jayega (Destination)</strong> clean card view me dikhai dega.
              </span>
              <button
                onClick={() => setActiveTab('fleet')}
                className="text-sky-600 hover:text-sky-700 font-semibold whitespace-nowrap ml-4"
              >
                View Fleet Table →
              </button>
            </div>
          </div>
        )}

        {activeTab === 'queues' && (
          <div className="space-y-4">
            <QueueEstimatorPanel
              loadingPoints={loadingPoints}
              unloadingPoints={unloadingPoints}
              trucks={trucks}
            />

            <DigitalMineMap
              trucks={trucks}
              loadingPoints={loadingPoints}
              unloadingPoints={unloadingPoints}
              selectedTruckId={selectedTruckId}
              onSelectTruck={setSelectedTruckId}
              onToggleShovelStatus={handleToggleShovelStatus}
              onToggleUnloadStatus={handleToggleUnloadStatus}
              algorithm={algorithm}
            />
          </div>
        )}

        {activeTab === 'benchmark' && (
          <div className="space-y-4">
            <ComparisonBenchmarking
              algorithm={algorithm}
              onSelectAlgorithm={setAlgorithm}
              metrics={currentMetrics}
              legacyReferenceMetrics={legacyReferenceMetrics}
              recentDispatches={recentDispatches}
            />
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <FleetManagerTable
              trucks={trucks}
              loadingPoints={loadingPoints}
              unloadingPoints={unloadingPoints}
              selectedTruckId={selectedTruckId}
              onSelectTruck={(id) => {
                setSelectedTruckId(id);
                if (id) setActiveTab('map');
              }}
              onToggleTruckMaintenance={handleToggleTruckMaintenance}
              onForceReroute={handleForceReroute}
            />
          </div>
        )}
      </main>

      {/* Solution Overview Modal */}
      <SolutionOverviewModal
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
      />

      {/* Location Manager Modal */}
      <LocationManagerModal
        isOpen={isLocationManagerOpen}
        onClose={() => setIsLocationManagerOpen(false)}
        loadingPoints={loadingPoints}
        unloadingPoints={unloadingPoints}
        onUpdateLoadingPoint={(updated) =>
          setLoadingPoints((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
        }
        onUpdateUnloadingPoint={(updated) =>
          setUnloadingPoints((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        }
        onAddLoadingPoint={(newPt) => setLoadingPoints((prev) => [...prev, newPt])}
      />

      {/* Clean Light Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="font-semibold text-slate-700">MineFleet Ai</span>
          <span className="mx-2">·</span>
          <span>Intelligent Mining Fleet & Route Optimisation Platform</span>
          <span className="mx-2">·</span>
          <span>Simulated Prototype (24 Trucks · 6 Shovels · 7 Unload Destinations)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <button onClick={() => setIsOverviewOpen(true)} className="hover:text-slate-900 font-medium">
            Solution Statement
          </button>
          <span>·</span>
          <button onClick={() => setIsLocationManagerOpen(true)} className="hover:text-slate-900 font-medium">
            Mine Layout
          </button>
        </div>
      </footer>
    </div>
  );
}
