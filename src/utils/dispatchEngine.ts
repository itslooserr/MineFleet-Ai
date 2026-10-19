/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DispatchAlgorithm,
  HaulTruck,
  LoadingPoint,
  UnloadingPoint,
  PerformanceMetrics,
} from '../types/mining';
import { calculateHaulRoute, getAccessNodeForLocation, HAUL_SEGMENTS } from './miningData';

export interface DispatchRecommendation {
  truckId: string;
  recommendedLoadingPointId: string;
  recommendedUnloadingPointId: string;
  expectedWaitTimeMin: number;
  projectedTravelTimeMin: number;
  reason: string;
}

export interface QueueEstimate {
  locationId: string;
  locationName: string;
  queueCount: number;
  activeCount: number;
  estimatedWaitMinutes: number;
  status: 'CLEAR' | 'MODERATE' | 'BOTTLENECK' | 'STARVED';
}

/**
 * Calculates live queue length and estimated waiting time for any loading or unloading point.
 */
export function calculateQueueEstimates(
  loadingPoints: LoadingPoint[],
  unloadingPoints: UnloadingPoint[],
  trucks: HaulTruck[]
): QueueEstimate[] {
  const estimates: QueueEstimate[] = [];

  // Evaluate Loading Points (Shovels)
  loadingPoints.forEach((load) => {
    const queuedTrucks = trucks.filter(
      (t) => t.assignedLoadingPointId === load.id && t.status === 'QUEUED_LOADING'
    );
    const activeTruck = trucks.find(
      (t) => t.assignedLoadingPointId === load.id && t.status === 'LOADING'
    );
    const approachingTrucks = trucks.filter(
      (t) => t.assignedLoadingPointId === load.id && t.status === 'TRAVELING_EMPTY'
    );

    // Each truck takes loadTimeSec (e.g. 120s = 2 min)
    let waitSec = 0;
    if (activeTruck) {
      waitSec += activeTruck.actionTimerSec || load.loadTimeSec / 2;
    }
    waitSec += queuedTrucks.length * load.loadTimeSec;

    const waitMin = parseFloat((waitSec / 60).toFixed(1));

    let status: QueueEstimate['status'] = 'CLEAR';
    if (load.status === 'BREAKDOWN') {
      status = 'BOTTLENECK';
    } else if (queuedTrucks.length >= 3) {
      status = 'BOTTLENECK';
    } else if (queuedTrucks.length >= 1) {
      status = 'MODERATE';
    } else if (!activeTruck && approachingTrucks.length === 0) {
      status = 'STARVED';
    }

    estimates.push({
      locationId: load.id,
      locationName: load.name,
      queueCount: queuedTrucks.length,
      activeCount: activeTruck ? 1 : 0,
      estimatedWaitMinutes: waitMin,
      status,
    });
  });

  // Evaluate Unloading Points (Crushers/Dumps)
  unloadingPoints.forEach((unload) => {
    const queuedTrucks = trucks.filter(
      (t) => t.assignedUnloadingPointId === unload.id && t.status === 'QUEUED_UNLOAD'
    );
    const activeTrucks = trucks.filter(
      (t) => t.assignedUnloadingPointId === unload.id && t.status === 'UNLOADING'
    );

    // Calculation accounting for parallel dump pockets
    const dumpSpots = unload.maxSimultaneousDumps || 1;
    const waitSec = (queuedTrucks.length / dumpSpots) * unload.dumpTimeSec;
    const waitMin = parseFloat((waitSec / 60).toFixed(1));

    let status: QueueEstimate['status'] = 'CLEAR';
    if (queuedTrucks.length >= 4) {
      status = 'BOTTLENECK';
    } else if (queuedTrucks.length >= 2) {
      status = 'MODERATE';
    }

    estimates.push({
      locationId: unload.id,
      locationName: unload.name,
      queueCount: queuedTrucks.length,
      activeCount: activeTrucks.length,
      estimatedWaitMinutes: waitMin,
      status,
    });
  });

  return estimates;
}

/**
 * Legacy Fixed Dispatch:
 * Fixed assignment based on truck ID modulo shovel count.
 * Never redirects based on queues or breakdowns.
 */
export function getLegacyDispatchAssignment(
  truck: HaulTruck,
  loadingPoints: LoadingPoint[],
  unloadingPoints: UnloadingPoint[]
): DispatchRecommendation {
  const truckNum = parseInt(truck.truckNumber.replace('DT-', ''), 10) || 101;
  const operationalLoads = loadingPoints.filter((l) => l.status !== 'MAINTENANCE');
  const targetLoad = operationalLoads[truckNum % operationalLoads.length] || loadingPoints[0];

  // Match default unloading point by material
  let targetUnload = unloadingPoints[0];
  if (targetLoad.material === 'WASTE_OVERBURDEN') {
    targetUnload = unloadingPoints.find((u) => u.type === 'WASTE_DUMP') || unloadingPoints[0];
  } else if (targetLoad.material === 'MEDIUM_GRADE_ROM') {
    targetUnload = unloadingPoints.find((u) => u.type === 'STOCKPILE') || unloadingPoints[0];
  } else {
    targetUnload = unloadingPoints.find((u) => u.type === 'CRUSHER') || unloadingPoints[0];
  }

  return {
    truckId: truck.id,
    recommendedLoadingPointId: targetLoad.id,
    recommendedUnloadingPointId: targetUnload.id,
    expectedWaitTimeMin: 4.5,
    projectedTravelTimeMin: 3.2,
    reason: `Fixed static assignment circuit [${targetLoad.code} -> ${targetUnload.code}] (Legacy FIFO)`,
  };
}

/**
 * PitFlow AI Dynamic Dispatch:
 * Real-time continuous mathematical optimization.
 * Evaluates arrival ETA, projected queue clearance, shovel starvation risk, and crusher blend needs.
 */
export function getAiOptimizedDispatchAssignment(
  truck: HaulTruck,
  loadingPoints: LoadingPoint[],
  unloadingPoints: UnloadingPoint[],
  allTrucks: HaulTruck[]
): DispatchRecommendation {
  // Only operational shovels
  const candidateLoads = loadingPoints.filter((l) => l.status === 'OPERATIONAL');

  if (candidateLoads.length === 0) {
    return getLegacyDispatchAssignment(truck, loadingPoints, unloadingPoints);
  }

  let bestLoad = candidateLoads[0];
  let minCostScore = Infinity;
  let chosenWaitMin = 0;
  let chosenTravelMin = 0;
  let decisionRationale = '';

  const truckCurrentNode = getAccessNodeForLocation(truck.assignedUnloadingPointId);

  candidateLoads.forEach((shovel) => {
    const shovelNode = getAccessNodeForLocation(shovel.id);
    const routeWaypoints = calculateHaulRoute(truckCurrentNode, shovelNode);

    // Estimate travel distance (roughly based on waypoint count & standard segments)
    const travelDistMeters = Math.max(300, routeWaypoints.length * 80);
    const avgEmptySpeedMps = (32 * 1000) / 3600; // ~8.8 m/s
    const travelTimeSec = travelDistMeters / avgEmptySpeedMps;
    const travelTimeMin = travelTimeSec / 60;

    // Projected shovel queue when truck arrives:
    // How many trucks are currently at or en-route to this shovel?
    const currentlyQueued = allTrucks.filter(
      (t) =>
        t.id !== truck.id &&
        t.assignedLoadingPointId === shovel.id &&
        (t.status === 'QUEUED_LOADING' || t.status === 'LOADING')
    );

    const enRouteTrucks = allTrucks.filter(
      (t) =>
        t.id !== truck.id &&
        t.assignedLoadingPointId === shovel.id &&
        t.status === 'TRAVELING_EMPTY'
    );

    // Queue clearing time in seconds
    const queueClearTimeSec = (currentlyQueued.length + enRouteTrucks.length * 0.7) * shovel.loadTimeSec;
    // Projected wait when we arrive
    const projectedWaitSec = Math.max(0, queueClearTimeSec - travelTimeSec);
    const projectedWaitMin = projectedWaitSec / 60;

    // Starvation penalty: If a high-capacity shovel has 0 trucks heading to it, prioritize it heavily!
    const isStarved = currentlyQueued.length === 0 && enRouteTrucks.length === 0;
    const starvationBonus = isStarved ? -5.0 : 0; // negative cost = high priority

    // Loading rate multiplier (faster shovel = higher productivity)
    const rateEfficiencyFactor = 1400 / shovel.loadingRateTph;

    // Overall objective function score (lower is better):
    // Cost = Travel Time + (2.5 * Wait Time) + (Rate Factor) + Starvation Bonus
    const costScore = travelTimeMin + projectedWaitMin * 2.8 * rateEfficiencyFactor + starvationBonus;

    if (costScore < minCostScore) {
      minCostScore = costScore;
      bestLoad = shovel;
      chosenWaitMin = parseFloat(projectedWaitMin.toFixed(1));
      chosenTravelMin = parseFloat(travelTimeMin.toFixed(1));

      if (isStarved) {
        decisionRationale = `High Priority: ${shovel.code} is starving (0 trucks en route). Re-directed to prevent shovel idle loss.`;
      } else if (projectedWaitMin < 1.0) {
        decisionRationale = `Optimal Match: ${shovel.code} has zero wait queue on arrival (ETA ${chosenTravelMin}m).`;
      } else {
        decisionRationale = `Minimizing fleet idle time: ${shovel.code} queue is only ${currentlyQueued.length} trucks (~${chosenWaitMin}m wait).`;
      }
    }
  });

  // Determine optimal unloading point based on material & live congestion
  let targetUnload = unloadingPoints[0];
  if (bestLoad.material === 'WASTE_OVERBURDEN' || bestLoad.material === 'IN_PIT_BACKFILL') {
    const wasteDumps = unloadingPoints.filter((u) => u.type === 'WASTE_DUMP');
    // Pick the waste dump with least queue
    targetUnload = wasteDumps.reduce((prev, curr) => {
      const prevQ = allTrucks.filter((t) => t.assignedUnloadingPointId === prev.id && t.status === 'QUEUED_UNLOAD').length;
      const currQ = allTrucks.filter((t) => t.assignedUnloadingPointId === curr.id && t.status === 'QUEUED_UNLOAD').length;
      return currQ < prevQ ? curr : prev;
    }, wasteDumps[0] || unloadingPoints[0]);
  } else if (bestLoad.material === 'LOW_GRADE_ORE') {
    targetUnload = unloadingPoints.find((u) => u.id === 'unload_4_stockpile_low') || unloadingPoints[0];
  } else if (bestLoad.material === 'MEDIUM_GRADE_ROM') {
    targetUnload = unloadingPoints.find((u) => u.id === 'unload_3_stockpile_rom') || unloadingPoints[0];
  } else {
    // High-grade copper ore goes to Primary Crusher 1 or Secondary Crusher 2
    const cr1 = unloadingPoints.find((u) => u.id === 'unload_1_crusher_primary');
    const cr2 = unloadingPoints.find((u) => u.id === 'unload_2_crusher_secondary');
    const q1 = allTrucks.filter((t) => t.assignedUnloadingPointId === cr1?.id && t.status === 'QUEUED_UNLOAD').length;
    const q2 = allTrucks.filter((t) => t.assignedUnloadingPointId === cr2?.id && t.status === 'QUEUED_UNLOAD').length;

    if (cr2 && q1 >= 2 && q2 < q1) {
      targetUnload = cr2;
      decisionRationale += ` Primary Crusher queue active (${q1} trucks), routed High-Grade Ore to Secondary Crusher #2.`;
    } else {
      targetUnload = cr1 || unloadingPoints[0];
    }
  }

  return {
    truckId: truck.id,
    recommendedLoadingPointId: bestLoad.id,
    recommendedUnloadingPointId: targetUnload.id,
    expectedWaitTimeMin: chosenWaitMin,
    projectedTravelTimeMin: chosenTravelMin,
    reason: decisionRationale,
  };
}

/**
 * Calculates high-precision performance metrics for the simulated fleet.
 */
export function calculatePerformanceMetrics(
  trucks: HaulTruck[],
  loadingPoints: LoadingPoint[],
  simulationElapsedSec: number
): PerformanceMetrics {
  const totalTons = trucks.reduce((sum, t) => sum + t.totalTonnageHauled, 0);
  const totalCycles = trucks.reduce((sum, t) => sum + t.completedCycles, 0);
  const totalWaitSec = trucks.reduce((sum, t) => sum + t.totalWaitTimeSec, 0);
  const totalTravelSec = trucks.reduce((sum, t) => sum + t.totalTravelTimeSec, 0);
  const totalFuel = trucks.reduce((sum, t) => sum + t.fuelBurnLiters, 0);

  const hoursElapsed = Math.max(0.05, simulationElapsedSec / 3600);
  const tonnagePerHour = Math.round(totalTons / hoursElapsed);

  const avgWaitMin =
    totalCycles > 0
      ? parseFloat(((totalWaitSec / totalCycles) / 60).toFixed(1))
      : parseFloat(((totalWaitSec / trucks.length) / 60).toFixed(1));

  const avgCycleTimeMin =
    totalCycles > 0
      ? parseFloat((((totalTravelSec + totalWaitSec) / totalCycles) / 60).toFixed(1))
      : 14.2;

  // Shovel Starvation Rate: % of operational time shovels spent waiting for trucks
  const totalOperationalShovelSec = loadingPoints.reduce(
    (sum, l) => sum + (l.totalOperationalTimeSec || simulationElapsedSec),
    0
  );
  const totalStarvationSec = loadingPoints.reduce((sum, l) => sum + l.starvationTimeSec, 0);
  const starvationPct =
    totalOperationalShovelSec > 0
      ? parseFloat(((totalStarvationSec / totalOperationalShovelSec) * 100).toFixed(1))
      : 0;

  // Truck utilization: % of time actively hauling or loading vs idle in queue
  const totalTime = totalTravelSec + totalWaitSec;
  const utilizationPct =
    totalTime > 0 ? parseFloat(((totalTravelSec / totalTime) * 100).toFixed(1)) : 82;

  const fuelPerTon = totalTons > 0 ? parseFloat((totalFuel / totalTons).toFixed(3)) : 0.38;

  // Value calculation: Copper ore delivered @ estimated margin $14.50/ton net
  const estimatedValue = Math.round(totalTons * 14.5);

  return {
    totalTonnageHauled: totalTons,
    tonnagePerHour,
    avgCycleTimeMinutes: avgCycleTimeMin,
    avgWaitTimePerCycleMin: avgWaitMin,
    shovelStarvationRatePct: Math.min(100, Math.max(0, starvationPct)),
    truckUtilizationPct: Math.min(100, Math.max(0, utilizationPct)),
    totalFuelBurnLiters: Math.round(totalFuel),
    fuelEfficiencyLitersPerTon: fuelPerTon,
    activeTruckCount: trucks.filter((t) => t.status !== 'MAINTENANCE').length,
    totalCyclesCompleted: totalCycles,
    estimatedShiftValueUsd: estimatedValue,
  };
}
