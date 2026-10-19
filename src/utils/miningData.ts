/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LoadingPoint,
  UnloadingPoint,
  HaulNode,
  HaulRoadSegment,
  HaulTruck,
  Point2D,
} from '../types/mining';

// Map coordinate dimensions
export const MAP_WIDTH = 1150;
export const MAP_HEIGHT = 740;

// Bench Contours for open-pit topography
export interface PitBenchContour {
  level: string;
  elevationM: number;
  color: string;
  path: string;
}

export const PIT_BENCHES: PitBenchContour[] = [
  {
    level: 'Surface Rim (+40m)',
    elevationM: 40,
    color: '#f8fafc',
    path: 'M 50,50 C 240,20 860,20 1080,50 C 1120,240 1100,560 1060,680 C 800,720 300,720 70,680 C 30,500 30,240 50,50 Z',
  },
  {
    level: 'Bench Level 1 (0m)',
    elevationM: 0,
    color: '#f1f5f9',
    path: 'M 120,110 C 300,75 800,75 1010,110 C 1040,270 1020,510 990,610 C 760,650 350,650 140,610 C 100,470 100,260 120,110 Z',
  },
  {
    level: 'Bench Level 2 (-40m)',
    elevationM: -40,
    color: '#e2e8f0',
    path: 'M 200,170 C 370,135 740,135 930,170 C 960,300 940,470 910,550 C 720,590 390,590 220,550 C 180,430 180,285 200,170 Z',
  },
  {
    level: 'Bench Level 3 (-80m)',
    elevationM: -80,
    color: '#cbd5e1',
    path: 'M 290,230 C 430,195 680,195 840,230 C 870,335 850,445 820,500 C 680,540 430,540 310,500 C 270,415 270,310 290,230 Z',
  },
  {
    level: 'Bench Level 4 (-120m)',
    elevationM: -120,
    color: '#b9c7d4',
    path: 'M 380,290 C 490,265 640,265 760,290 C 780,365 770,435 740,470 C 630,495 480,495 400,470 C 370,405 370,340 380,290 Z',
  },
  {
    level: 'Pit Floor Deep Sulphide (-160m)',
    elevationM: -160,
    color: '#9aaebf',
    path: 'M 470,345 C 540,330 610,330 670,345 C 690,390 680,425 660,445 C 610,460 520,460 480,445 C 460,415 460,375 470,345 Z',
  },
];

// 6 Loading Points (Shovels & Excavators)
export const INITIAL_LOADING_POINTS: LoadingPoint[] = [
  {
    id: 'load_1_north',
    name: 'Shovel 1 (North Face)',
    code: 'SH-01',
    benchLevel: '-40m Bench',
    elevationM: -40,
    material: 'HIGH_GRADE_COPPER',
    shovelType: 'ELECTRIC_ROPE_SHOVEL',
    x: 320,
    y: 260,
    loadingRateTph: 1450,
    loadTimeSec: 120,
    currentTruckId: null,
    queue: [],
    maxQueueCapacity: 6,
    status: 'OPERATIONAL',
    totalLoadedTonnage: 0,
    starvationTimeSec: 0,
    totalOperationalTimeSec: 0,
  },
  {
    id: 'load_2_east',
    name: 'Shovel 2 (East Wall)',
    code: 'SH-02',
    benchLevel: '-80m Bench',
    elevationM: -80,
    material: 'MEDIUM_GRADE_ROM',
    shovelType: 'HYDRAULIC_SHOVEL',
    x: 800,
    y: 350,
    loadingRateTph: 1200,
    loadTimeSec: 135,
    currentTruckId: null,
    queue: [],
    maxQueueCapacity: 5,
    status: 'OPERATIONAL',
    totalLoadedTonnage: 0,
    starvationTimeSec: 0,
    totalOperationalTimeSec: 0,
  },
  {
    id: 'load_3_central',
    name: 'Shovel 3 (Central Pit)',
    code: 'SH-03',
    benchLevel: '-120m Bench',
    elevationM: -120,
    material: 'HIGH_GRADE_COPPER',
    shovelType: 'ELECTRIC_ROPE_SHOVEL',
    x: 480,
    y: 390,
    loadingRateTph: 1600,
    loadTimeSec: 110,
    currentTruckId: null,
    queue: [],
    maxQueueCapacity: 6,
    status: 'OPERATIONAL',
    totalLoadedTonnage: 0,
    starvationTimeSec: 0,
    totalOperationalTimeSec: 0,
  },
  {
    id: 'load_4_south',
    name: 'Excavator 4 (South Pushback)',
    code: 'EX-04',
    benchLevel: '-60m Pushback',
    elevationM: -60,
    material: 'WASTE_OVERBURDEN',
    shovelType: 'BACKHOE_EXCAVATOR',
    x: 360,
    y: 490,
    loadingRateTph: 980,
    loadTimeSec: 155,
    currentTruckId: null,
    queue: [],
    maxQueueCapacity: 5,
    status: 'OPERATIONAL',
    totalLoadedTonnage: 0,
    starvationTimeSec: 0,
    totalOperationalTimeSec: 0,
  },
  {
    id: 'load_5_deep',
    name: 'Shovel 5 (Deep Sump Floor)',
    code: 'SH-05',
    benchLevel: '-160m Deep Pit',
    elevationM: -160,
    material: 'HIGH_GRADE_COPPER',
    shovelType: 'ELECTRIC_ROPE_SHOVEL',
    x: 600,
    y: 420,
    loadingRateTph: 1650,
    loadTimeSec: 105,
    currentTruckId: null,
    queue: [],
    maxQueueCapacity: 6,
    status: 'OPERATIONAL',
    totalLoadedTonnage: 0,
    starvationTimeSec: 0,
    totalOperationalTimeSec: 0,
  },
  {
    id: 'load_6_west',
    name: 'Excavator 6 (West Ridge Face)',
    code: 'EX-06',
    benchLevel: '-20m Upper Ridge',
    elevationM: -20,
    material: 'LOW_GRADE_ORE',
    shovelType: 'HYDRAULIC_SHOVEL',
    x: 230,
    y: 200,
    loadingRateTph: 1100,
    loadTimeSec: 140,
    currentTruckId: null,
    queue: [],
    maxQueueCapacity: 5,
    status: 'OPERATIONAL',
    totalLoadedTonnage: 0,
    starvationTimeSec: 0,
    totalOperationalTimeSec: 0,
  },
];

// 7 Unloading Destinations
export const INITIAL_UNLOADING_POINTS: UnloadingPoint[] = [
  {
    id: 'unload_1_crusher_primary',
    name: 'Primary Gyratory Crusher #1',
    code: 'CR-01',
    type: 'CRUSHER',
    elevationM: 40,
    acceptedMaterials: ['HIGH_GRADE_COPPER', 'MEDIUM_GRADE_ROM'],
    x: 890,
    y: 110,
    dumpTimeSec: 45,
    currentTruckIds: [],
    maxSimultaneousDumps: 2,
    queue: [],
    maxQueueCapacity: 6,
    status: 'OPERATIONAL',
    totalDumpedTonnage: 0,
    totalTrucksDumped: 0,
  },
  {
    id: 'unload_2_crusher_secondary',
    name: 'Secondary Cone Crusher #2',
    code: 'CR-02',
    type: 'CRUSHER',
    elevationM: 38,
    acceptedMaterials: ['HIGH_GRADE_COPPER'],
    x: 740,
    y: 90,
    dumpTimeSec: 45,
    currentTruckIds: [],
    maxSimultaneousDumps: 2,
    queue: [],
    maxQueueCapacity: 5,
    status: 'OPERATIONAL',
    totalDumpedTonnage: 0,
    totalTrucksDumped: 0,
  },
  {
    id: 'unload_3_stockpile_rom',
    name: 'ROM Mill Stockpile A',
    code: 'SP-ROM',
    type: 'STOCKPILE',
    elevationM: 35,
    acceptedMaterials: ['MEDIUM_GRADE_ROM', 'HIGH_GRADE_COPPER'],
    x: 1000,
    y: 230,
    dumpTimeSec: 40,
    currentTruckIds: [],
    maxSimultaneousDumps: 3,
    queue: [],
    maxQueueCapacity: 6,
    status: 'OPERATIONAL',
    totalDumpedTonnage: 0,
    totalTrucksDumped: 0,
  },
  {
    id: 'unload_4_stockpile_low',
    name: 'Low-Grade Ore Stockpile B',
    code: 'SP-LOW',
    type: 'STOCKPILE',
    elevationM: 30,
    acceptedMaterials: ['LOW_GRADE_ORE', 'MEDIUM_GRADE_ROM'],
    x: 970,
    y: 350,
    dumpTimeSec: 40,
    currentTruckIds: [],
    maxSimultaneousDumps: 2,
    queue: [],
    maxQueueCapacity: 5,
    status: 'OPERATIONAL',
    totalDumpedTonnage: 0,
    totalTrucksDumped: 0,
  },
  {
    id: 'unload_5_waste_south',
    name: 'South Waste Rock Dump',
    code: 'WD-SOUTH',
    type: 'WASTE_DUMP',
    elevationM: 25,
    acceptedMaterials: ['WASTE_OVERBURDEN'],
    x: 180,
    y: 110,
    dumpTimeSec: 35,
    currentTruckIds: [],
    maxSimultaneousDumps: 4,
    queue: [],
    maxQueueCapacity: 8,
    status: 'OPERATIONAL',
    totalDumpedTonnage: 0,
    totalTrucksDumped: 0,
  },
  {
    id: 'unload_6_waste_north',
    name: 'North Overburden Dump',
    code: 'WD-NORTH',
    type: 'WASTE_DUMP',
    elevationM: 35,
    acceptedMaterials: ['WASTE_OVERBURDEN'],
    x: 390,
    y: 60,
    dumpTimeSec: 35,
    currentTruckIds: [],
    maxSimultaneousDumps: 3,
    queue: [],
    maxQueueCapacity: 6,
    status: 'OPERATIONAL',
    totalDumpedTonnage: 0,
    totalTrucksDumped: 0,
  },
  {
    id: 'unload_7_inpit_backfill',
    name: 'In-Pit Backfill Sump Area',
    code: 'BF-PIT',
    type: 'WASTE_DUMP',
    elevationM: -60,
    acceptedMaterials: ['WASTE_OVERBURDEN', 'IN_PIT_BACKFILL'],
    x: 740,
    y: 530,
    dumpTimeSec: 35,
    currentTruckIds: [],
    maxSimultaneousDumps: 2,
    queue: [],
    maxQueueCapacity: 5,
    status: 'OPERATIONAL',
    totalDumpedTonnage: 0,
    totalTrucksDumped: 0,
  },
];

// Haul Road Navigation Nodes
export const HAUL_NODES: HaulNode[] = [
  // Surface Highway Nodes
  { id: 'node_waste_south', name: 'South Waste Ramp', x: 220, y: 130, elevationM: 25, isJunction: true },
  { id: 'node_waste_north', name: 'North Overburden Access', x: 390, y: 85, elevationM: 35, isJunction: true },
  { id: 'node_surface_hub', name: 'Surface Central Hub', x: 550, y: 100, elevationM: 38, isJunction: true },
  { id: 'node_crusher_2', name: 'Secondary Crusher 2 Access', x: 740, y: 120, elevationM: 38, isJunction: true },
  { id: 'node_crusher_1', name: 'Primary Crusher 1 Access', x: 890, y: 140, elevationM: 40, isJunction: true },
  { id: 'node_sp_rom', name: 'ROM Stockpile Access', x: 950, y: 230, elevationM: 35, isJunction: true },
  { id: 'node_sp_low', name: 'Low Grade Stockpile Access', x: 920, y: 350, elevationM: 30, isJunction: true },

  // West & North Ramp Nodes into Pit
  { id: 'node_west_ridge_acc', name: 'West Ridge Access', x: 230, y: 200, elevationM: -20 },
  { id: 'node_ramp_nw', name: 'Northwest Ramp Turn', x: 280, y: 160, elevationM: 10, isJunction: true },
  { id: 'node_sh1_acc', name: 'Shovel 1 Access', x: 320, y: 260, elevationM: -40 },
  { id: 'node_ramp_w_mid', name: 'West Ramp Mid (-60m)', x: 310, y: 360, elevationM: -60, isJunction: true },
  { id: 'node_ex4_acc', name: 'Excavator 4 South Access', x: 360, y: 490, elevationM: -60 },

  // Central & Deep Floor
  { id: 'node_sh3_acc', name: 'Shovel 3 Central Access', x: 480, y: 390, elevationM: -120 },
  { id: 'node_floor_junction', name: 'Pit Floor Hub (-140m)', x: 540, y: 430, elevationM: -140, isJunction: true },
  { id: 'node_sh5_acc', name: 'Shovel 5 Sump Access', x: 600, y: 420, elevationM: -160 },

  // East Ramp & In-Pit Backfill Nodes
  { id: 'node_ramp_e_crest', name: 'East Surface Crest', x: 820, y: 190, elevationM: 30, isJunction: true },
  { id: 'node_ramp_e_mid', name: 'East Ramp Mid (-40m)', x: 860, y: 280, elevationM: -40, isJunction: true },
  { id: 'node_sh2_acc', name: 'Shovel 2 East Access', x: 800, y: 350, elevationM: -80 },
  { id: 'node_backfill_acc', name: 'In-Pit Backfill Access', x: 740, y: 530, elevationM: -60 },
  { id: 'node_ramp_se', name: 'Southeast Switchback', x: 700, y: 450, elevationM: -100, isJunction: true },
];

// Haul Road Segments connecting nodes
export const HAUL_SEGMENTS: HaulRoadSegment[] = [
  // Surface loop
  {
    id: 'seg_waste_s_hub',
    fromNodeId: 'node_waste_south',
    toNodeId: 'node_surface_hub',
    distanceM: 330,
    gradePct: 1.5,
    maxSpeedKmh: 35,
    waypoints: [{ x: 220, y: 130 }, { x: 380, y: 110 }, { x: 550, y: 100 }],
  },
  {
    id: 'seg_waste_n_hub',
    fromNodeId: 'node_waste_north',
    toNodeId: 'node_surface_hub',
    distanceM: 160,
    gradePct: 0.5,
    maxSpeedKmh: 30,
    waypoints: [{ x: 390, y: 85 }, { x: 470, y: 90 }, { x: 550, y: 100 }],
  },
  {
    id: 'seg_hub_crusher2',
    fromNodeId: 'node_surface_hub',
    toNodeId: 'node_crusher_2',
    distanceM: 190,
    gradePct: 1.0,
    maxSpeedKmh: 35,
    waypoints: [{ x: 550, y: 100 }, { x: 650, y: 110 }, { x: 740, y: 120 }],
  },
  {
    id: 'seg_crusher2_crusher1',
    fromNodeId: 'node_crusher_2',
    toNodeId: 'node_crusher_1',
    distanceM: 150,
    gradePct: 1.2,
    maxSpeedKmh: 35,
    waypoints: [{ x: 740, y: 120 }, { x: 810, y: 130 }, { x: 890, y: 140 }],
  },
  {
    id: 'seg_crusher1_sp_rom',
    fromNodeId: 'node_crusher_1',
    toNodeId: 'node_sp_rom',
    distanceM: 120,
    gradePct: 1.0,
    maxSpeedKmh: 30,
    waypoints: [{ x: 890, y: 140 }, { x: 920, y: 180 }, { x: 950, y: 230 }],
  },
  {
    id: 'seg_sp_rom_sp_low',
    fromNodeId: 'node_sp_rom',
    toNodeId: 'node_sp_low',
    distanceM: 130,
    gradePct: 1.5,
    maxSpeedKmh: 30,
    waypoints: [{ x: 950, y: 230 }, { x: 940, y: 290 }, { x: 920, y: 350 }],
  },

  // West pit descent
  {
    id: 'seg_hub_nw_turn',
    fromNodeId: 'node_surface_hub',
    toNodeId: 'node_ramp_nw',
    distanceM: 280,
    gradePct: 4.5,
    maxSpeedKmh: 28,
    waypoints: [{ x: 550, y: 100 }, { x: 420, y: 130 }, { x: 280, y: 160 }],
  },
  {
    id: 'seg_nw_west_ridge',
    fromNodeId: 'node_ramp_nw',
    toNodeId: 'node_west_ridge_acc',
    distanceM: 60,
    gradePct: 2.0,
    maxSpeedKmh: 24,
    waypoints: [{ x: 280, y: 160 }, { x: 230, y: 200 }],
  },
  {
    id: 'seg_nw_sh1',
    fromNodeId: 'node_ramp_nw',
    toNodeId: 'node_sh1_acc',
    distanceM: 110,
    gradePct: 6.0,
    maxSpeedKmh: 25,
    waypoints: [{ x: 280, y: 160 }, { x: 295, y: 210 }, { x: 320, y: 260 }],
  },
  {
    id: 'seg_sh1_w_mid',
    fromNodeId: 'node_sh1_acc',
    toNodeId: 'node_ramp_w_mid',
    distanceM: 120,
    gradePct: 7.5,
    maxSpeedKmh: 24,
    waypoints: [{ x: 320, y: 260 }, { x: 300, y: 310 }, { x: 310, y: 360 }],
  },
  {
    id: 'seg_w_mid_ex4',
    fromNodeId: 'node_ramp_w_mid',
    toNodeId: 'node_ex4_acc',
    distanceM: 140,
    gradePct: 3.0,
    maxSpeedKmh: 24,
    waypoints: [{ x: 310, y: 360 }, { x: 325, y: 430 }, { x: 360, y: 490 }],
  },
  {
    id: 'seg_w_mid_sh3',
    fromNodeId: 'node_ramp_w_mid',
    toNodeId: 'node_sh3_acc',
    distanceM: 170,
    gradePct: 7.8,
    maxSpeedKmh: 22,
    waypoints: [{ x: 310, y: 360 }, { x: 390, y: 380 }, { x: 480, y: 390 }],
  },
  {
    id: 'seg_sh3_floor',
    fromNodeId: 'node_sh3_acc',
    toNodeId: 'node_floor_junction',
    distanceM: 80,
    gradePct: 6.0,
    maxSpeedKmh: 22,
    waypoints: [{ x: 480, y: 390 }, { x: 510, y: 415 }, { x: 540, y: 430 }],
  },
  {
    id: 'seg_floor_sh5',
    fromNodeId: 'node_floor_junction',
    toNodeId: 'node_sh5_acc',
    distanceM: 70,
    gradePct: 5.0,
    maxSpeedKmh: 20,
    waypoints: [{ x: 540, y: 430 }, { x: 570, y: 425 }, { x: 600, y: 420 }],
  },

  // East pit descent
  {
    id: 'seg_crusher1_e_crest',
    fromNodeId: 'node_crusher_1',
    toNodeId: 'node_ramp_e_crest',
    distanceM: 90,
    gradePct: 3.0,
    maxSpeedKmh: 26,
    waypoints: [{ x: 890, y: 140 }, { x: 820, y: 190 }],
  },
  {
    id: 'seg_e_crest_e_mid',
    fromNodeId: 'node_ramp_e_crest',
    toNodeId: 'node_ramp_e_mid',
    distanceM: 110,
    gradePct: 7.0,
    maxSpeedKmh: 24,
    waypoints: [{ x: 820, y: 190 }, { x: 855, y: 235 }, { x: 860, y: 280 }],
  },
  {
    id: 'seg_e_mid_sh2',
    fromNodeId: 'node_ramp_e_mid',
    toNodeId: 'node_sh2_acc',
    distanceM: 90,
    gradePct: 7.5,
    maxSpeedKmh: 24,
    waypoints: [{ x: 860, y: 280 }, { x: 835, y: 315 }, { x: 800, y: 350 }],
  },
  {
    id: 'seg_sh2_se',
    fromNodeId: 'node_sh2_acc',
    toNodeId: 'node_ramp_se',
    distanceM: 140,
    gradePct: 8.0,
    maxSpeedKmh: 22,
    waypoints: [{ x: 800, y: 350 }, { x: 755, y: 405 }, { x: 700, y: 450 }],
  },
  {
    id: 'seg_se_backfill',
    fromNodeId: 'node_ramp_se',
    toNodeId: 'node_backfill_acc',
    distanceM: 90,
    gradePct: 3.5,
    maxSpeedKmh: 24,
    waypoints: [{ x: 700, y: 450 }, { x: 720, y: 490 }, { x: 740, y: 530 }],
  },
  {
    id: 'seg_se_floor',
    fromNodeId: 'node_ramp_se',
    toNodeId: 'node_floor_junction',
    distanceM: 160,
    gradePct: 7.0,
    maxSpeedKmh: 22,
    waypoints: [{ x: 700, y: 450 }, { x: 620, y: 440 }, { x: 540, y: 430 }],
  },
];

// Graph pathfinder (Dijkstra)
export function calculateHaulRoute(
  startNodeId: string,
  endNodeId: string
): Point2D[] {
  if (startNodeId === endNodeId) {
    const node = HAUL_NODES.find((n) => n.id === startNodeId);
    return node ? [{ x: node.x, y: node.y }] : [];
  }

  const adj = new Map<string, { to: string; waypoints: Point2D[]; dist: number }[]>();
  HAUL_NODES.forEach((node) => adj.set(node.id, []));

  HAUL_SEGMENTS.forEach((seg) => {
    adj.get(seg.fromNodeId)?.push({
      to: seg.toNodeId,
      waypoints: seg.waypoints,
      dist: seg.distanceM,
    });
    adj.get(seg.toNodeId)?.push({
      to: seg.fromNodeId,
      waypoints: [...seg.waypoints].reverse(),
      dist: seg.distanceM,
    });
  });

  const distances = new Map<string, number>();
  const previous = new Map<string, { from: string; waypoints: Point2D[] }>();
  const unvisited = new Set<string>();

  HAUL_NODES.forEach((n) => {
    distances.set(n.id, Infinity);
    unvisited.add(n.id);
  });
  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    let current: string | null = null;
    let minD = Infinity;
    unvisited.forEach((nodeId) => {
      const d = distances.get(nodeId)!;
      if (d < minD) {
        minD = d;
        current = nodeId;
      }
    });

    if (!current || minD === Infinity || current === endNodeId) break;
    unvisited.delete(current);

    const neighbors = adj.get(current) || [];
    for (const edge of neighbors) {
      if (!unvisited.has(edge.to)) continue;
      const alt = minD + edge.dist;
      if (alt < distances.get(edge.to)!) {
        distances.set(edge.to, alt);
        previous.set(edge.to, { from: current, waypoints: edge.waypoints });
      }
    }
  }

  const fullWaypoints: Point2D[] = [];
  let curr = endNodeId;
  const segmentsToAssemble: Point2D[][] = [];

  while (curr !== startNodeId) {
    const prevEntry = previous.get(curr);
    if (!prevEntry) break;
    segmentsToAssemble.unshift(prevEntry.waypoints);
    curr = prevEntry.from;
  }

  for (let i = 0; i < segmentsToAssemble.length; i++) {
    const segPoints = segmentsToAssemble[i];
    for (let j = 0; j < segPoints.length; j++) {
      if (
        fullWaypoints.length > 0 &&
        Math.abs(fullWaypoints[fullWaypoints.length - 1].x - segPoints[j].x) < 1 &&
        Math.abs(fullWaypoints[fullWaypoints.length - 1].y - segPoints[j].y) < 1
      ) {
        continue;
      }
      fullWaypoints.push(segPoints[j]);
    }
  }

  if (fullWaypoints.length === 0) {
    const startNode = HAUL_NODES.find((n) => n.id === startNodeId);
    const endNode = HAUL_NODES.find((n) => n.id === endNodeId);
    if (startNode && endNode) {
      return [{ x: startNode.x, y: startNode.y }, { x: endNode.x, y: endNode.y }];
    }
  }

  return fullWaypoints;
}

// Map Location ID to Nearest Graph Node
export function getAccessNodeForLocation(locationId: string): string {
  switch (locationId) {
    case 'load_1_north':
      return 'node_sh1_acc';
    case 'load_2_east':
      return 'node_sh2_acc';
    case 'load_3_central':
      return 'node_sh3_acc';
    case 'load_4_south':
      return 'node_ex4_acc';
    case 'load_5_deep':
      return 'node_sh5_acc';
    case 'load_6_west':
      return 'node_west_ridge_acc';

    case 'unload_1_crusher_primary':
      return 'node_crusher_1';
    case 'unload_2_crusher_secondary':
      return 'node_crusher_2';
    case 'unload_3_stockpile_rom':
      return 'node_sp_rom';
    case 'unload_4_stockpile_low':
      return 'node_sp_low';
    case 'unload_5_waste_south':
      return 'node_waste_south';
    case 'unload_6_waste_north':
      return 'node_waste_north';
    case 'unload_7_inpit_backfill':
      return 'node_backfill_acc';

    default:
      return 'node_surface_hub';
  }
}

// 24 Real Operators / Drivers for the 24 Dump Trucks
export const TRUCK_DRIVERS = [
  'Vikram Malhotra',
  'Arjun Mehta',
  'Rajesh Sharma',
  'Priya Patel',
  'Ramesh Verma',
  'Amit Singh',
  'Kavita Nair',
  'Suresh Joshi',
  'Devendra Rao',
  'Sunil Yadav',
  'Mohit Gupta',
  'Anil Saxena',
  'Deepak Chaudhary',
  'Rohan Kulkarni',
  'Manoj Tiwari',
  'Girish Pandey',
  'Harish Rawat',
  'Karan Deshmukh',
  'Naveen Bishnoi',
  'Balram Chauhan',
  'Tarun Bhatia',
  'Pankaj Tripathi',
  'Sandeep Kadam',
  'Sachin Yadav',
];

// Create the 24 Simulated Dump Trucks
export function create24Fleet(): HaulTruck[] {
  const trucks: HaulTruck[] = [];
  const truckModels = [
    'Cat 793F (240T)',
    'Komatsu 930E-5 (290T)',
    'Cat 789D (200T)',
    'Hitachi EH5000 (296T)',
  ];

  // Distribute across the 6 loading points and 7 unloading points
  const loadPointIds = [
    'load_1_north',
    'load_2_east',
    'load_3_central',
    'load_4_south',
    'load_5_deep',
    'load_6_west',
  ];

  const unloadPointIds = [
    'unload_1_crusher_primary',
    'unload_2_crusher_secondary',
    'unload_3_stockpile_rom',
    'unload_4_stockpile_low',
    'unload_5_waste_south',
    'unload_6_waste_north',
    'unload_7_inpit_backfill',
  ];

  for (let i = 0; i < 24; i++) {
    const num = (201 + i).toString();
    const model = truckModels[i % truckModels.length];
    const capacity = model.includes('290') || model.includes('296') ? 290 : model.includes('200') ? 200 : 240;

    // Stagger statuses: 12 traveling empty, 8 traveling loaded, 2 queued, 2 loading
    let status: HaulTruck['status'] = 'TRAVELING_EMPTY';
    let assignedLoad = loadPointIds[i % loadPointIds.length];
    let assignedUnload = unloadPointIds[i % unloadPointIds.length];
    let currentPayload = 0;
    let startNode = getAccessNodeForLocation(assignedUnload);
    let targetNode = getAccessNodeForLocation(assignedLoad);

    if (i % 3 === 1) {
      status = 'TRAVELING_LOADED';
      currentPayload = capacity;
      startNode = getAccessNodeForLocation(assignedLoad);
      targetNode = getAccessNodeForLocation(assignedUnload);
    } else if (i === 4 || i === 10) {
      status = 'QUEUED_LOADING';
      currentPayload = 0;
    } else if (i === 15) {
      status = 'LOADING';
      currentPayload = Math.round(capacity * 0.6);
    }

    const route = calculateHaulRoute(startNode, targetNode);
    const initialPos = route[0] || { x: 550, y: 100 };

    // Slower realistic speeds (20-28 km/h)
    const baseSpeed = status === 'TRAVELING_EMPTY' ? 26 : 18;

    trucks.push({
      id: `DT-${num}`,
      truckNumber: `DT-${num}`,
      model,
      driverName: TRUCK_DRIVERS[i % TRUCK_DRIVERS.length],
      capacityTons: capacity,
      currentPayloadTons: currentPayload,
      status,
      x: initialPos.x,
      y: initialPos.y,
      headingDeg: (i * 45) % 360,
      currentSpeedKmh: baseSpeed,
      targetSpeedKmh: baseSpeed,
      assignedLoadingPointId: assignedLoad,
      assignedUnloadingPointId: assignedUnload,
      targetNodeId: targetNode,
      routePath: route,
      pathIndex: 0,
      progressAlongSegment: ((i * 0.12) % 0.85),
      actionTimerSec: status === 'LOADING' ? 45 : 0,
      cycleWaitTimeSec: 0,
      cycleTotalTimeSec: 0,
      totalWaitTimeSec: Math.floor(Math.random() * 90),
      totalTravelTimeSec: 420,
      totalTonnageHauled: (i % 4) * capacity,
      completedCycles: i % 4,
      fuelBurnLiters: 65 + i * 5,
      dispatchDecisionReason: `Route to ${assignedLoad.toUpperCase()} balanced for travel time and minimum queue delay`,
      rerouteCount: 0,
    });
  }

  return trucks;
}
