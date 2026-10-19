/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PerformanceMetrics,
  DispatchAlgorithm,
} from '../types/mining';
import {
  Clock,
  RotateCw,
  Percent,
  TrendingUp,
  Fuel,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ComparisonBenchmarkingProps {
  algorithm: DispatchAlgorithm;
  onSelectAlgorithm: (algo: DispatchAlgorithm) => void;
  metrics: PerformanceMetrics;
  legacyReferenceMetrics: PerformanceMetrics;
  recentDispatches: {
    truckId: string;
    destination: string;
    reason: string;
    timestamp: string;
    algorithm: DispatchAlgorithm;
  }[];
}

export const ComparisonBenchmarking: React.FC<ComparisonBenchmarkingProps> = ({
  algorithm,
  onSelectAlgorithm,
  metrics,
  legacyReferenceMetrics,
  recentDispatches,
}) => {
  const isOptimized = algorithm === 'AI_OPTIMIZED';
  const activeMetrics = metrics;
  const baseline = legacyReferenceMetrics;

  // 5 Core Indicators
  const waitReductionPct = Math.max(
    0,
    Math.round(
      ((baseline.avgWaitTimePerCycleMin - activeMetrics.avgWaitTimePerCycleMin) /
        Math.max(0.1, baseline.avgWaitTimePerCycleMin)) * 100
    )
  );

  const turnaroundDeltaMin = (baseline.avgCycleTimeMinutes - activeMetrics.avgCycleTimeMinutes).toFixed(1);
  const utilisationDeltaPct = (activeMetrics.truckUtilizationPct - baseline.truckUtilizationPct).toFixed(1);

  const tonnageGainPct = Math.round(
    ((activeMetrics.tonnagePerHour - baseline.tonnagePerHour) / Math.max(1, baseline.tonnagePerHour)) * 100
  );

  const fuelSavedPct = Math.max(
    0,
    Math.round(
      ((baseline.fuelEfficiencyLitersPerTon - activeMetrics.fuelEfficiencyLitersPerTon) /
        Math.max(0.01, baseline.fuelEfficiencyLitersPerTon)) * 100
    )
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      {/* Top Header & Segmented Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Performance Analysis: Existing vs. Optimised Scenario
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare baseline operations with the MineFleet AI dynamic optimisation scenario (24 dump trucks, 6 loading points, 7 unloading destinations).
          </p>
        </div>

        {/* Clean Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => onSelectAlgorithm('LEGACY_FIXED')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              algorithm === 'LEGACY_FIXED'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Existing Scenario (Baseline FIFO)
          </button>
          <button
            onClick={() => onSelectAlgorithm('AI_OPTIMIZED')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              algorithm === 'AI_OPTIMIZED'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Optimised Scenario (MineFleet Ai)</span>
          </button>
        </div>
      </div>

      {/* 5 Core Indicator KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Waiting Time */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Waiting Time</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {activeMetrics.avgWaitTimePerCycleMin} <span className="text-xs font-normal text-slate-500">min/cycle</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-200 flex justify-between">
            <span>Baseline:</span>
            <span className="font-mono text-slate-700">{baseline.avgWaitTimePerCycleMin} min</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600 font-mono">
            {isOptimized ? `-${waitReductionPct}% Wait Reduction` : 'Baseline'}
          </div>
        </div>

        {/* 2. Turnaround Time */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Turnaround Time</span>
            <RotateCw className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {activeMetrics.avgCycleTimeMinutes} <span className="text-xs font-normal text-slate-500">min/round</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-200 flex justify-between">
            <span>Baseline:</span>
            <span className="font-mono text-slate-700">{baseline.avgCycleTimeMinutes} min</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600 font-mono">
            {isOptimized ? `${turnaroundDeltaMin} min Faster Cycles` : 'Baseline'}
          </div>
        </div>

        {/* 3. Fleet Utilisation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Fleet Utilisation</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {activeMetrics.truckUtilizationPct}%
          </div>
          <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-200 flex justify-between">
            <span>Baseline:</span>
            <span className="font-mono text-slate-700">{baseline.truckUtilizationPct}%</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600 font-mono">
            {isOptimized ? `+${utilisationDeltaPct}% Productive Time` : 'Baseline'}
          </div>
        </div>

        {/* 4. Tonnes Transported */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Tonnes Transported</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {activeMetrics.tonnagePerHour.toLocaleString()} <span className="text-xs font-normal text-slate-500">T/hr</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-200 flex justify-between">
            <span>Baseline:</span>
            <span className="font-mono text-slate-700">{baseline.tonnagePerHour.toLocaleString()} T/hr</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600 font-mono">
            {isOptimized ? `+${tonnageGainPct}% Material Uplift` : 'Baseline'}
          </div>
        </div>

        {/* 5. Fuel Consumption */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Fuel Consumption</span>
            <Fuel className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {activeMetrics.fuelEfficiencyLitersPerTon} <span className="text-xs font-normal text-slate-500">L/Ton</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-200 flex justify-between">
            <span>Baseline:</span>
            <span className="font-mono text-slate-700">{baseline.fuelEfficiencyLitersPerTon} L/Ton</span>
          </div>
          <div className="text-[11px] font-bold text-emerald-600 font-mono">
            {isOptimized ? `-${fuelSavedPct}% Diesel Saved` : 'Baseline'}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-mono text-[11px]">
              <th className="py-3 px-4">Indicator / Metric</th>
              <th className="py-3 px-4">Existing Baseline (Fixed FIFO)</th>
              <th className="py-3 px-4 bg-sky-50 text-sky-900 font-bold border-x border-sky-100">
                MineFleet Ai (Optimised)
              </th>
              <th className="py-3 px-4">Operational Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            <tr className="hover:bg-slate-50/60">
              <td className="py-3 px-4 font-sans font-medium text-slate-900">
                1. Waiting Time (Queuing Delay)
              </td>
              <td className="py-3 px-4 text-slate-600">7.4 min / cycle</td>
              <td className="py-3 px-4 bg-sky-50/50 text-emerald-700 font-bold border-x border-sky-100">
                1.6 min / cycle (-78%)
              </td>
              <td className="py-3 px-4 font-sans text-slate-600">
                Minimises avoidable queues at loading and unloading points
              </td>
            </tr>
            <tr className="hover:bg-slate-50/60">
              <td className="py-3 px-4 font-sans font-medium text-slate-900">
                2. Turnaround Time (Cycle Duration)
              </td>
              <td className="py-3 px-4 text-slate-600">18.2 min per trip</td>
              <td className="py-3 px-4 bg-sky-50/50 text-emerald-700 font-bold border-x border-sky-100">
                13.5 min per trip (-26%)
              </td>
              <td className="py-3 px-4 font-sans text-slate-600">
                Faster haul cycles and more material moved per shift
              </td>
            </tr>
            <tr className="hover:bg-slate-50/60">
              <td className="py-3 px-4 font-sans font-medium text-slate-900">
                3. Fleet Utilisation Rate
              </td>
              <td className="py-3 px-4 text-slate-600">64.2% active movement</td>
              <td className="py-3 px-4 bg-sky-50/50 text-emerald-700 font-bold border-x border-sky-100">
                88.5% active movement (+24%)
              </td>
              <td className="py-3 px-4 font-sans text-slate-600">
                Distributes workloads effectively across all 24 trucks and 6 shovels
              </td>
            </tr>
            <tr className="hover:bg-slate-50/60">
              <td className="py-3 px-4 font-sans font-medium text-slate-900">
                4. Material Transported (Tonnes)
              </td>
              <td className="py-3 px-4 text-slate-600">2,850 T / hr</td>
              <td className="py-3 px-4 bg-sky-50/50 text-emerald-700 font-bold border-x border-sky-100">
                3,640 T / hr (+27.7%)
              </td>
              <td className="py-3 px-4 font-sans text-slate-600">
                Significantly higher production without capital expenditure on new trucks
              </td>
            </tr>
            <tr className="hover:bg-slate-50/60">
              <td className="py-3 px-4 font-sans font-medium text-slate-900">
                5. Estimated Fuel Consumption
              </td>
              <td className="py-3 px-4 text-slate-600">0.432 L / Ton</td>
              <td className="py-3 px-4 bg-sky-50/50 text-emerald-700 font-bold border-x border-sky-100">
                0.338 L / Ton (-21.7%)
              </td>
              <td className="py-3 px-4 font-sans text-slate-600">
                Reduces unnecessary truck idling and diesel operating costs
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <span className="font-bold text-slate-800">Notice: </span>
        All simulated results are simulated prototype metrics for evaluation and comparative demonstration.
      </div>

      {/* Dispatch Feed */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-800">
          Live Dispatch Recommendations & Assignment Feed
        </div>
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {recentDispatches.slice(0, 8).map((log, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-700">{log.truckId}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">{log.destination}</span>
                <span className="text-slate-600 font-sans text-[11px] ml-2 line-clamp-1">
                  {log.reason}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-sans">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
