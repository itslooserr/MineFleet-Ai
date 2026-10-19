/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SolutionOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunOptimisedDemo?: () => void;
}

export const SolutionOverviewModal: React.FC<SolutionOverviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'statement' | 'how_it_works' | 'benefits' | 'prototype'>('statement');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <div className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>MineFleet Ai</span>
              <span className="text-xs text-slate-500 font-normal">· Solution Overview</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Smarter Routes. Faster Haulage. Optimised Operations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-100 bg-white text-xs">
          {[
            { id: 'statement', label: 'Solution Statement' },
            { id: 'how_it_works', label: 'How It Works' },
            { id: 'benefits', label: 'Key Benefits' },
            { id: 'prototype', label: 'Prototype Setup' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-xs leading-relaxed">
          {activeTab === 'statement' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Solution Statement
                </h3>
                <p className="text-slate-700 text-xs leading-relaxed">
                  MineFleet AI is an AI powered platform designed to optimise the movement of dump trucks and haulage vehicles in mining operations. It combines intelligent route planning, fleet monitoring, predictive queue analytics, automated dispatch recommendations and digital twin simulation to improve transportation efficiency.
                </p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  The platform analyses vehicle status, travel times, loading and unloading activities, queue lengths and road conditions to identify operational bottlenecks. It then recommends suitable truck assignments and efficient routes to reduce avoidable waiting, improve fleet utilisation and support better operational decisions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-2">
                <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                  Vision
                </h4>
                <p className="text-sky-950 text-xs italic">
                  "To build a smarter mining transportation ecosystem where every route, vehicle assignment and operational decision contributes to efficient, coordinated and responsible material movement."
                </p>
              </div>
            </div>
          )}

          {activeTab === 'how_it_works' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">1. Fleet Monitoring</div>
                  <p className="text-slate-600">
                    Tracks vehicle locations, status, routes, payloads and operational activities using available GPS, sensor or simulated data.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">2. Bottleneck Detection</div>
                  <p className="text-slate-600">
                    Identifies congestion, long queues, underutilised loading points and unnecessary vehicle waiting.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">3. Predictive Analytics</div>
                  <p className="text-slate-600">
                    Estimates future queue lengths, arrival times and potential delays using current operational conditions and historical or simulated data.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">4. Intelligent Routing and Dispatch</div>
                  <p className="text-slate-600">
                    Recommends efficient routes and truck assignments by considering travel time, predicted waiting, vehicle compatibility and operational constraints.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">5. Digital Twin Simulation</div>
                  <p className="text-slate-600">
                    Creates a virtual representation of mining operations to test proposed changes before real world implementation.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">6. Performance Analysis</div>
                  <p className="text-slate-600">
                    Compares existing and optimised scenarios using waiting time, turnaround time, fleet utilisation, tonnes transported and estimated fuel consumption.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs">Key Operational Benefits</div>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Reduced Waiting Time:</strong> Minimises avoidable queues at loading and unloading points.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Optimised Routes:</strong> Identifies more efficient routes based on travel time, congestion and route restrictions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Improved Fleet Utilisation:</strong> Helps distribute workloads more effectively across available trucks and loading facilities.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Potential Cost Savings:</strong> Reduces unnecessary idling and inefficient travel, lowering fuel consumption and operating costs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Higher Operational Productivity:</strong> Supports more efficient material transportation and better coordination.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Data Driven Decisions:</strong> Provides operational insights and explainable recommendations for mine supervisors.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'prototype' && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs">Current Prototype Setup</div>
                <p className="text-slate-700">
                  The initial prototype uses a simulated mining environment consisting of <strong>24 dump trucks</strong>, <strong>6 loading points</strong>, and <strong>7 unloading destinations</strong>.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2 text-center font-mono">
                  <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <div className="text-xl font-bold text-sky-700">24</div>
                    <div className="text-[11px] text-slate-600 font-sans font-medium">Dump Trucks</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <div className="text-xl font-bold text-amber-700">6</div>
                    <div className="text-[11px] text-slate-600 font-sans font-medium">Loading Shovels</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <div className="text-xl font-bold text-emerald-700">7</div>
                    <div className="text-[11px] text-slate-600 font-sans font-medium">Unload Destinations</div>
                  </div>
                </div>
              </div>

              <p className="text-slate-500 text-[11px]">
                The simulation demonstrates how congestion at one loading point and unused capacity at another creates inefficiencies, and how MineFleet AI analyses conditions and recommends optimal truck assignments.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs">
          <span className="text-slate-500">MineFleet Ai Prototype Specification</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
