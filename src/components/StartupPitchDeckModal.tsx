/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle,
  TrendingUp,
  Cpu,
  DollarSign,
  PlayCircle,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

interface StartupPitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenarioDemo: (scenarioName: string) => void;
}

export const StartupPitchDeckModal: React.FC<StartupPitchDeckModalProps> = ({
  isOpen,
  onClose,
  onRunScenarioDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'problem' | 'solution' | 'demo' | 'business'>('problem');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Startup Competition MVP · Judge Presentation Deck
              </h2>
              <p className="text-xs text-slate-400">
                PitFlow AI: Autonomous Mine Fleet Dispatcher (Zero Hardware CapEx)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs">
          {[
            { id: 'problem', label: '1. The $1.2B Mining Bottleneck' },
            { id: 'solution', label: '2. Software-Only MVP Architecture' },
            { id: 'demo', label: '3. Interactive Judge Demo Script' },
            { id: 'business', label: '4. Unit Economics & SaaS ROI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          {activeTab === 'problem' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
                <span className="text-xs uppercase font-mono font-bold text-red-400">
                  The Core Industry Inefficiency
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  "Truck Bunching" Wastes 25% of Mining Haulage Engine Hours
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In surface open-pit mining, haulage represents <strong>45% to 55% of all operating expenses (OPEX)</strong>.
                  Today, over 70% of developing open-pit mines still operate on static, fixed circuits or manual FIFO
                  (First-In-First-Out) dispatching.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">01. Idle Queue Time</span>
                  <div className="text-lg font-bold font-mono text-red-400">6 – 9 Min / Cycle</div>
                  <p className="text-xs text-slate-400">
                    240-ton dumpers sit idling behind congested shovels burning diesel without moving ore.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">02. Shovel Starvation</span>
                  <div className="text-lg font-bold font-mono text-amber-400">18% Machine Downtime</div>
                  <p className="text-xs text-slate-400">
                    Multi-million dollar electric rope shovels sit empty while trucks are stuck across the pit.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">03. The Hardware Trap</span>
                  <div className="text-lg font-bold font-mono text-slate-200">$50,000+ / Truck</div>
                  <p className="text-xs text-slate-400">
                    Legacy vendors force high upfront hardware purchases and 18-month deployment cycles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'solution' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-2">
                <span className="text-xs uppercase font-mono font-bold text-amber-400">
                  Our Unfair Advantage: Pure Software MVP
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  Zero Hardware CapEx · Instant 2-Week Deployment
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Instead of spending millions on custom OEM hardware, PitFlow AI runs as a lightweight,
                  cloud-native dynamic optimization engine. Trucks use standard rugged Android in-cab tablets
                  or existing telematics GPS feeds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                    <Cpu className="w-4 h-4" />
                    <span>Real-time Dynamic Dispatch Engine</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates shovel queue states, haul road grade speeds, shovel loading rates (TPH), and crusher
                    blending targets at every trip interval to match trucks with optimal loading spots.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Autonomous En-Route Recovery</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    If an excavator breaks down or a crusher jams, PitFlow AI dynamically diverts approaching
                    trucks to alternative shovels, preventing sudden choke points before they occur.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Competition Live Demo Script for Judges
                </h3>
                <p className="text-xs text-slate-400">
                  Click any scenario button below to trigger the testable proof directly in the live simulation:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-colors">
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">
                      Proof 1: Compare Legacy FIFO vs PitFlow AI
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Shows how switching to AI dynamic dispatch cuts average queue wait time from 7.4m to 1.6m.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onRunScenarioDemo('toggle_ai');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Run Demo
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-colors">
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">
                      Proof 2: Inject Shovel A-101 Breakdown Disruption
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Watch how PitFlow AI instantly diverts dumpers to Shovel B-202 and D-404 without human intervention.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onRunScenarioDemo('shovel_breakdown');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded text-xs transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Break Shovel
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-colors">
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">
                      Proof 3: Stress-Test Fleet Scalability (20 Dumpers)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Simulate a full 20-truck mining fleet navigating the multi-bench haul roads under peak load.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onRunScenarioDemo('scale_fleet');
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded text-xs transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Scale Fleet
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
                <span className="text-xs uppercase font-mono font-bold text-emerald-400">
                  Business Model & Unit Economics
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  SaaS Subscription: $350 / Truck / Month
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Predictable recurring revenue with an undeniable customer ROI: saving just 1 cycle per truck per day
                  returns <strong>$8,000+ per month per truck</strong> in incremental net ore value!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">Per Site Annual ARR</span>
                  <div className="text-lg font-bold font-mono text-emerald-400">$252,000 / yr</div>
                  <p className="text-xs text-slate-400">Based on an average 60-truck open pit copper/gold mine.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">Mine Payback Period</span>
                  <div className="text-lg font-bold font-mono text-amber-400">&lt; 14 Days</div>
                  <p className="text-xs text-slate-400">Production uplift pays for the annual software license within 2 weeks.</p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">Global Market (TAM)</span>
                  <div className="text-lg font-bold font-mono text-sky-400">$4.8 Billion</div>
                  <p className="text-xs text-slate-400">15,000+ open-pit mines globally transitioning to digital operations.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <span className="text-slate-400">
            Startup Competition Pitch Deck · Ready for presentation
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-lg transition-colors"
          >
            Close Deck & Return to Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
