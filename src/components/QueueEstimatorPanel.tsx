/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LoadingPoint, UnloadingPoint, HaulTruck } from '../types/mining';
import { calculateQueueEstimates } from '../utils/dispatchEngine';
import { Clock, AlertTriangle, Flame } from 'lucide-react';

interface QueueEstimatorPanelProps {
  loadingPoints: LoadingPoint[];
  unloadingPoints: UnloadingPoint[];
  trucks: HaulTruck[];
  onSelectLocation?: (id: string) => void;
}

export const QueueEstimatorPanel: React.FC<QueueEstimatorPanelProps> = ({
  loadingPoints,
  unloadingPoints,
  trucks,
  onSelectLocation,
}) => {
  const estimates = calculateQueueEstimates(loadingPoints, unloadingPoints, trucks);
  const totalQueuedTrucks = estimates.reduce((sum, e) => sum + e.queueCount, 0);
  const bottlenecks = estimates.filter((e) => e.status === 'BOTTLENECK' || e.status === 'STARVED');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Live Queue & Waiting-Time Estimator
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Total Waiting in Queues:</span>
            <span className="font-mono font-bold text-slate-900">{totalQueuedTrucks} trucks</span>
          </div>
          {bottlenecks.length > 0 && (
            <div className="flex items-center gap-1 text-red-600 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{bottlenecks.length} Active Bottlenecks</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Queue Estimates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {estimates.map((est) => {
          const isBottleneck = est.status === 'BOTTLENECK';
          const isStarved = est.status === 'STARVED';
          const isModerate = est.status === 'MODERATE';

          let statusColor = 'text-emerald-700';
          let borderColor = 'border-slate-200';
          let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          let statusLabel = 'Nominal Flow';

          if (isBottleneck) {
            statusColor = 'text-red-700';
            borderColor = 'border-red-200 bg-red-50/30';
            badgeBg = 'bg-red-50 text-red-700 border-red-200';
            statusLabel = 'Queue Choked';
          } else if (isStarved) {
            statusColor = 'text-amber-700';
            borderColor = 'border-amber-200 bg-amber-50/30';
            badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
            statusLabel = 'Starved (Idle)';
          } else if (isModerate) {
            statusColor = 'text-orange-700';
            borderColor = 'border-orange-200 bg-orange-50/30';
            badgeBg = 'bg-orange-50 text-orange-700 border-orange-200';
            statusLabel = 'Moderate Wait';
          }

          const queuedTruckList = trucks.filter((t) => {
            if (t.assignedLoadingPointId === est.locationId && t.status === 'QUEUED_LOADING') return true;
            if (t.assignedUnloadingPointId === est.locationId && t.status === 'QUEUED_UNLOAD') return true;
            return false;
          });

          return (
            <div
              key={est.locationId}
              onClick={() => onSelectLocation && onSelectLocation(est.locationId)}
              className={`p-3.5 rounded-lg border ${borderColor} transition-all hover:shadow-xs cursor-pointer bg-white`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {est.locationName}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {est.activeCount > 0 ? '1 Active in Spot' : 'Spot Empty'}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border font-mono uppercase font-semibold ${badgeBg}`}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Waiting Metric */}
              <div className="flex items-baseline justify-between mt-1 mb-2">
                <span className="text-xs text-slate-500 font-medium">Est. Queue Delay:</span>
                <span className={`text-base font-bold font-mono ${statusColor}`}>
                  {est.estimatedWaitMinutes} <span className="text-xs font-normal">min</span>
                </span>
              </div>

              {/* Visual Queue Slots */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span>Queue Staging:</span>
                  <span className="font-mono font-medium text-slate-700">{est.queueCount} Trucks Waiting</span>
                </div>
                <div className="flex items-center gap-1.5 h-6">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const truckAtSlot = queuedTruckList[slotIdx];
                    return (
                      <div
                        key={slotIdx}
                        className={`flex-1 h-full rounded flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${
                          truckAtSlot
                            ? isBottleneck
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-orange-100 text-orange-800 border border-orange-300'
                            : 'bg-slate-50 border border-slate-200 text-slate-400'
                        }`}
                        title={truckAtSlot ? `${truckAtSlot.truckNumber} in queue` : 'Open slot'}
                      >
                        {truckAtSlot ? truckAtSlot.truckNumber.replace('DT-', '') : '—'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Insight */}
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
        <Flame className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Operational Insight:</strong> When multiple dumpers arrive at the same shovel or crusher simultaneously, truck bunching delays can cause trucks to idle <strong>6–9 minutes per cycle</strong>. MineFleet AI balances assignments across all 6 shovels to eliminate bottleneck lines.
        </span>
      </div>
    </div>
  );
};
