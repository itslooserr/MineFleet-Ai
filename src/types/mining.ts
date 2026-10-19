/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TruckStatus =
  | 'TRAVELING_EMPTY'
  | 'QUEUED_LOADING'
  | 'LOADING'
  | 'TRAVELING_LOADED'
  | 'QUEUED_UNLOAD'
  | 'UNLOADING'
  | 'MAINTENANCE';

export type MaterialType =
  | 'HIGH_GRADE_COPPER'
  | 'MEDIUM_GRADE_ROM'
  | 'LOW_GRADE_ORE'
  | 'WASTE_OVERBURDEN'
  | 'IN_PIT_BACKFILL';

export type ShovelType = 'ELECTRIC_ROPE_SHOVEL' | 'HYDRAULIC_SHOVEL' | 'BACKHOE_EXCAVATOR';

export type UnloadType = 'CRUSHER' | 'STOCKPILE' | 'WASTE_DUMP';

export interface Point2D {
  x: number;
  y: number;
}

export interface LoadingPoint {
  id: string;
  name: string;
  code: string;
  benchLevel: string; // e.g. "-120m"
  elevationM: number;
  material: MaterialType;
  shovelType: ShovelType;
  x: number;
  y: number;
  loadingRateTph: number; // Tonnes per hour
  loadTimeSec: number; // Time to fill a 240t truck
  currentTruckId: string | null;
  queue: string[]; // Array of truck IDs in waiting line
  maxQueueCapacity: number;
  status: 'OPERATIONAL' | 'BREAKDOWN' | 'MAINTENANCE';
  totalLoadedTonnage: number;
  starvationTimeSec: number;
  totalOperationalTimeSec: number;
}

export interface UnloadingPoint {
  id: string;
  name: string;
  code: string;
  type: UnloadType;
  elevationM: number;
  acceptedMaterials: MaterialType[];
  x: number;
  y: number;
  dumpTimeSec: number;
  currentTruckIds: string[];
  maxSimultaneousDumps: number;
  queue: string[];
  maxQueueCapacity: number;
  status: 'OPERATIONAL' | 'CONGESTED' | 'MAINTENANCE';
  totalDumpedTonnage: number;
  totalTrucksDumped: number;
}

export interface HaulNode {
  id: string;
  name: string;
  x: number;
  y: number;
  elevationM: number;
  isJunction?: boolean;
}

export interface HaulRoadSegment {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceM: number;
  gradePct: number; // slope percentage
  maxSpeedKmh: number;
  waypoints: Point2D[];
}

export interface HaulTruck {
  id: string;
  truckNumber: string;
  model: string;
  driverName: string;
  capacityTons: number;
  currentPayloadTons: number;
  status: TruckStatus;
  x: number;
  y: number;
  headingDeg: number;
  currentSpeedKmh: number;
  targetSpeedKmh: number;
  assignedLoadingPointId: string;
  assignedUnloadingPointId: string;
  targetNodeId: string;
  routePath: Point2D[];
  pathIndex: number;
  progressAlongSegment: number; // 0 to 1
  actionTimerSec: number; // counts down loading/unloading
  cycleWaitTimeSec: number;
  cycleTotalTimeSec: number;
  totalWaitTimeSec: number;
  totalTravelTimeSec: number;
  totalTonnageHauled: number;
  completedCycles: number;
  fuelBurnLiters: number;
  dispatchDecisionReason: string;
  rerouteCount: number;
}

export type DispatchAlgorithm = 'LEGACY_FIXED' | 'AI_OPTIMIZED';

export interface PerformanceMetrics {
  totalTonnageHauled: number;
  tonnagePerHour: number;
  avgCycleTimeMinutes: number;
  avgWaitTimePerCycleMin: number;
  shovelStarvationRatePct: number;
  truckUtilizationPct: number;
  totalFuelBurnLiters: number;
  fuelEfficiencyLitersPerTon: number;
  activeTruckCount: number;
  totalCyclesCompleted: number;
  estimatedShiftValueUsd: number; // based on ore value delivered
}

export interface ComparisonAudit {
  legacy: PerformanceMetrics;
  optimized: PerformanceMetrics;
  tonnageGainPct: number;
  waitTimeReductionPct: number;
  shovelStarvationReductionPct: number;
  fuelSavedLiters: number;
  shiftRevenueDeltaUsd: number;
  co2EmissionsSavedKg: number;
}
