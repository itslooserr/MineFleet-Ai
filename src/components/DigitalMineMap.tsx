/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  HaulTruck,
  LoadingPoint,
  UnloadingPoint,
  DispatchAlgorithm,
} from '../types/mining';
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  PIT_BENCHES,
  HAUL_NODES,
  HAUL_SEGMENTS,
} from '../utils/miningData';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Truck,
  User,
  Package,
  Navigation,
  X,
  Gauge,
  Layers,
} from 'lucide-react';

interface DigitalMineMapProps {
  trucks: HaulTruck[];
  loadingPoints: LoadingPoint[];
  unloadingPoints: UnloadingPoint[];
  selectedTruckId: string | null;
  onSelectTruck: (truckId: string | null) => void;
  onToggleShovelStatus: (shovelId: string) => void;
  onToggleUnloadStatus: (unloadId: string) => void;
  algorithm: DispatchAlgorithm;
}

export const DigitalMineMap: React.FC<DigitalMineMapProps> = ({
  trucks,
  loadingPoints,
  unloadingPoints,
  selectedTruckId,
  onSelectTruck,
  onToggleShovelStatus,
  onToggleUnloadStatus,
  algorithm,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Hover state for instant truck card preview
  const [hoveredTruckId, setHoveredTruckId] = useState<string | null>(null);

  // Layer toggles
  const [showContours, setShowContours] = useState(true);
  const [showRoadNetwork, setShowRoadNetwork] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'map-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Determine active truck to display
  const displayTruckId = selectedTruckId || hoveredTruckId;
  const activeTruck = trucks.find((t) => t.id === displayTruckId);

  const getDestinationText = (truck: HaulTruck) => {
    if (truck.status === 'TRAVELING_EMPTY' || truck.status === 'QUEUED_LOADING' || truck.status === 'LOADING') {
      const shovel = loadingPoints.find((l) => l.id === truck.assignedLoadingPointId);
      return shovel ? `${shovel.name} (${shovel.benchLevel})` : 'Loading Shovel';
    } else {
      const unload = unloadingPoints.find((u) => u.id === truck.assignedUnloadingPointId);
      return unload ? unload.name : 'Unloading Facility';
    }
  };

  return (
    <div className="relative w-full h-[640px] bg-white rounded-xl border border-slate-200 overflow-hidden select-none shadow-sm flex flex-col">
      {/* Top Map Toolbar - Crisp Clean Light Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-100" />
            <span className="text-xs font-bold text-slate-800">
              Open-Pit Mine Digital Twin Map
            </span>
          </div>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-500 font-mono">
            {trucks.length} Dump Trucks · 6 Shovels · 7 Unloading Sites
          </span>
        </div>

        {/* Layer Controls & Zoom */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setShowContours(!showContours)}
              className={`px-2.5 py-1 rounded transition-colors ${
                showContours ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pit Benches
            </button>
            <button
              onClick={() => setShowRoadNetwork(!showRoadNetwork)}
              className={`px-2.5 py-1 rounded transition-colors ${
                showRoadNetwork ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Haul Roads
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2.5 py-1 rounded transition-colors ${
                showLabels ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Truck Tags
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
              className="p-1 text-slate-600 hover:text-slate-900"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-600 px-1 font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.65, z - 0.15))}
              className="p-1 text-slate-600 hover:text-slate-900"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1 text-slate-600 hover:text-slate-900"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas (Light Topographic Map) */}
      <div
        ref={containerRef}
        id="map-bg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden bg-slate-100"
      >
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <filter id="lightShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>
            <filter id="truckShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Field */}
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#f1f5f9" />

          {/* Topographic Pit Benches (Clean Relief Shading) */}
          {showContours &&
            PIT_BENCHES.map((bench, idx) => (
              <g key={bench.level}>
                <path
                  d={bench.path}
                  fill={bench.color}
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  filter="url(#lightShadow)"
                />
                <text
                  x={130 + idx * 45}
                  y={120 + idx * 35}
                  fill="#475569"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="JetBrains Mono"
                  className="select-none pointer-events-none opacity-60"
                >
                  {bench.level}
                </text>
              </g>
            ))}

          {/* Haul Road Network (Dark Asphalt for maximum contrast on light terrain) */}
          {showRoadNetwork && (
            <g id="haul-roads">
              {HAUL_SEGMENTS.map((seg) => {
                const pathStr = seg.waypoints.reduce(
                  (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
                  ''
                );
                return (
                  <g key={seg.id}>
                    {/* Road curb */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity="0.9"
                    />
                    {/* Asphalt surface */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Crisp white center dash */}
                    <path
                      d={pathStr}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      strokeDasharray="4 6"
                      strokeOpacity="0.75"
                    />
                  </g>
                );
              })}

              {/* Haul Nodes */}
              {HAUL_NODES.map((node) => (
                <circle
                  key={node.id}
                  cx={node.x}
                  cy={node.y}
                  r="3.5"
                  fill="#64748b"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              ))}
            </g>
          )}

          {/* Active Truck Route Highlight */}
          {activeTruck && activeTruck.routePath && activeTruck.routePath.length > 1 && (
            <g id="active-route">
              <path
                d={activeTruck.routePath.reduce(
                  (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
                  ''
                )}
                fill="none"
                stroke="#0284c7"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeOpacity="0.95"
              />
            </g>
          )}

          {/* 6 Loading Points (Shovels) */}
          {loadingPoints.map((load) => {
            const isBroken = load.status === 'BREAKDOWN';
            const queuedTrucks = trucks.filter(
              (t) => t.assignedLoadingPointId === load.id && t.status === 'QUEUED_LOADING'
            );

            return (
              <g
                key={load.id}
                transform={`translate(${load.x}, ${load.y})`}
                className="cursor-pointer group"
                onClick={() => onToggleShovelStatus(load.id)}
              >
                {/* Halo */}
                <circle
                  r="32"
                  fill={isBroken ? '#fef2f2' : '#eff6ff'}
                  stroke={isBroken ? '#ef4444' : '#3b82f6'}
                  strokeWidth="1.8"
                  filter="url(#lightShadow)"
                />

                {/* Shovel Base */}
                <rect
                  x="-16"
                  y="-12"
                  width="32"
                  height="24"
                  rx="4"
                  fill={isBroken ? '#dc2626' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Bucket Boom */}
                <path
                  d="M 4,-3 L 20,-16 L 25,-10 L 16,3 Z"
                  fill={isBroken ? '#f87171' : '#60a5fa'}
                />

                {/* Shovel Code */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  {load.code}
                </text>

                {/* Name Label */}
                <text
                  x="0"
                  y="-22"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="11"
                  fontWeight="700"
                >
                  {load.name}
                </text>

                <text
                  x="0"
                  y="-34"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontWeight="500"
                  fontFamily="JetBrains Mono"
                >
                  {load.benchLevel} · {load.loadingRateTph} T/h
                </text>

                {/* Queue Tag */}
                {queuedTrucks.length > 0 && (
                  <g transform="translate(-24, 18)">
                    <rect x="0" y="0" width="48" height="15" rx="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1.2" />
                    <text x="24" y="11" textAnchor="middle" fill="#c2410c" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono">
                      Queue: {queuedTrucks.length}
                    </text>
                  </g>
                )}

                {isBroken && (
                  <g transform="translate(-30, 18)">
                    <rect x="0" y="0" width="60" height="15" rx="3" fill="#dc2626" />
                    <text x="30" y="11" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      BREAKDOWN
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 7 Unloading Destinations */}
          {unloadingPoints.map((unload) => {
            const isCrusher = unload.type === 'CRUSHER';
            const isStockpile = unload.type === 'STOCKPILE';
            const queuedTrucks = trucks.filter(
              (t) => t.assignedUnloadingPointId === unload.id && t.status === 'QUEUED_UNLOAD'
            );

            return (
              <g
                key={unload.id}
                transform={`translate(${unload.x}, ${unload.y})`}
                className="cursor-pointer group"
                onClick={() => onToggleUnloadStatus(unload.id)}
              >
                {/* Station Ring */}
                <circle
                  r="34"
                  fill={isCrusher ? '#fef3c7' : isStockpile ? '#ecfdf5' : '#f8fafc'}
                  stroke={isCrusher ? '#d97706' : isStockpile ? '#059669' : '#64748b'}
                  strokeWidth="1.8"
                  filter="url(#lightShadow)"
                />

                {/* Facility Icon */}
                {isCrusher ? (
                  <polygon
                    points="-15,-12 15,-12 9,12 -9,12"
                    fill="#b45309"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                ) : isStockpile ? (
                  <path
                    d="M -18,12 L 0,-12 L 18,12 Z"
                    fill="#047857"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                ) : (
                  <rect
                    x="-16"
                    y="-10"
                    width="32"
                    height="20"
                    rx="3"
                    fill="#475569"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                )}

                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  {unload.code}
                </text>

                <text
                  x="0"
                  y="-22"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="11"
                  fontWeight="700"
                >
                  {unload.name.split(' (')[0]}
                </text>

                {queuedTrucks.length > 0 && (
                  <g transform="translate(-24, 18)">
                    <rect x="0" y="0" width="48" height="15" rx="3" fill="#ffffff" stroke="#ea580c" strokeWidth="1.2" />
                    <text x="24" y="11" textAnchor="middle" fill="#c2410c" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono">
                      Wait: {queuedTrucks.length}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 24 Dump Trucks (Vibrant High-Contrast Markers) */}
          {trucks.map((truck) => {
            const isSelected = truck.id === selectedTruckId;
            const isHovered = truck.id === hoveredTruckId;
            const isLoaded = truck.currentPayloadTons > 0;
            const isQueued = truck.status === 'QUEUED_LOADING' || truck.status === 'QUEUED_UNLOAD';
            const isWorking = truck.status === 'LOADING' || truck.status === 'UNLOADING';

            let truckColor = '#eab308'; // Empty = Bright Yellow
            let strokeColor = '#854d0e';
            if (isLoaded) {
              truckColor = '#2563eb'; // Loaded = Vivid Cobalt Blue
              strokeColor = '#1e3a8a';
            }
            if (isQueued) {
              truckColor = '#ea580c'; // Queued = Vibrant Orange
              strokeColor = '#7c2d12';
            }
            if (isWorking) {
              truckColor = '#16a34a'; // Active = Green
              strokeColor = '#14532d';
            }

            return (
              <g
                key={truck.id}
                transform={`translate(${truck.x}, ${truck.y})`}
                className="cursor-pointer"
                filter="url(#truckShadow)"
                onMouseEnter={() => setHoveredTruckId(truck.id)}
                onMouseLeave={() => setHoveredTruckId(null)}
                onClick={() => onSelectTruck(isSelected ? null : truck.id)}
              >
                {/* Selection Halo */}
                {(isSelected || isHovered) && (
                  <circle
                    r="22"
                    fill="none"
                    stroke={isSelected ? '#0284c7' : '#f59e0b'}
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Rotated Truck */}
                <g transform={`rotate(${truck.headingDeg})`}>
                  {/* Heavy Off-Road Tires */}
                  <rect x="-9" y="-7" width="4.5" height="3.5" rx="1" fill="#0f172a" />
                  <rect x="5" y="-7" width="4.5" height="3.5" rx="1" fill="#0f172a" />
                  <rect x="-9" y="3.5" width="4.5" height="3.5" rx="1" fill="#0f172a" />
                  <rect x="5" y="3.5" width="4.5" height="3.5" rx="1" fill="#0f172a" />

                  {/* Steel Dump Bed */}
                  <rect
                    x="-8"
                    y="-5"
                    width="16"
                    height="10"
                    rx="1.5"
                    fill={truckColor}
                    stroke={strokeColor}
                    strokeWidth="1.2"
                  />

                  {/* Cab */}
                  <rect x="4" y="-3.5" width="4" height="7" rx="1" fill="#0f172a" />

                  {/* Loaded Ore */}
                  {isLoaded && (
                    <rect x="-6" y="-3.5" width="9" height="7" rx="1" fill="#78350f" />
                  )}
                </g>

                {/* Floating Tag */}
                {showLabels && (
                  <g transform="translate(0, -13)">
                    <rect
                      x="-16"
                      y="-8"
                      width="32"
                      height="12"
                      rx="3"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fill={isSelected ? '#0284c7' : '#0f172a'}
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono"
                    >
                      {truck.truckNumber}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* 
          CLEAN LIGHT TRUCK DETAIL CARD (HOVER & CLICK)
          User requested:
          "gadio k upar click karne se driver kon hai gadi ka number kya haii kya load hai aur kaha jayega ye sab card view me hover me show hoga .. complicated ui maat banana"
        */}
        {activeTruck && (
          <div className="absolute top-4 right-4 z-30 w-84 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-xl space-y-3">
            {/* Header: Gadi Number & Model */}
            <div className="flex items-start justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold font-mono text-slate-900">
                    {activeTruck.truckNumber}
                  </div>
                  <div className="text-xs text-slate-500 font-sans">
                    {activeTruck.model}
                  </div>
                </div>
              </div>

              {selectedTruckId && (
                <button
                  onClick={() => onSelectTruck(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                  title="Close Card"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Details: Driver, Load, Kaha Jayega */}
            <div className="space-y-2 text-xs">
              {/* Driver */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium">Driver:</span>
                </span>
                <span className="font-bold text-slate-900">
                  {activeTruck.driverName}
                </span>
              </div>

              {/* Kya Load Hai */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-medium">Kya Load Hai:</span>
                </span>
                <span className="font-mono font-bold">
                  {activeTruck.currentPayloadTons > 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {activeTruck.currentPayloadTons} Tonnes Ore
                    </span>
                  ) : (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Empty (0 Tonnes)
                    </span>
                  )}
                </span>
              </div>

              {/* Kaha Jayega (Destination) */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-slate-500 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium">Kaha Jayega (Destination):</span>
                </div>
                <div className="font-bold text-slate-900 pl-5 text-[13px]">
                  {getDestinationText(activeTruck)}
                </div>
              </div>

              {/* Speed & Status */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-sans">Status:</span>
                  <span className="font-bold text-slate-800">
                    {activeTruck.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-sans">Speed:</span>
                  <span className="font-bold text-slate-800">
                    {activeTruck.currentSpeedKmh} km/h (Slow/Steady)
                  </span>
                </div>
              </div>
            </div>

            {/* Routing Note */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Recommended Route: </span>
              {activeTruck.dispatchDecisionReason}
            </div>
          </div>
        )}

        {/* Legend at bottom left */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 rounded-lg text-xs space-y-1 shadow-sm">
          <div className="text-[11px] font-bold text-slate-800">Map Legend</div>
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-yellow-400 border border-yellow-600 inline-block" />
              <span>Empty Truck</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-600 border border-blue-800 inline-block" />
              <span>Loaded (Ore)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-orange-600 border border-orange-800 inline-block" />
              <span>In Queue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-green-600 border border-green-800 inline-block" />
              <span>Load / Dump</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
