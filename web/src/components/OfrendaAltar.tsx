"use client";

import React, { useState } from "react";
import { Flame, Flower, ShieldAlert, GitCommit, Users, Clock, Award, Sparkles, BookOpen } from "lucide-react";
import TerminalWhisper from "./TerminalWhisper";

export interface Contributor {
  name: string;
  commits: number;
  lastActive: string;
}

export interface AncestorRepo {
  id: string;
  name: string;
  description: string;
  historicalEra: string;
  lastActiveYear: string;
  abandonmentRisk: number;
  status: "FATALLY_ABANDONED" | "DORMANT_RELIC" | "ACTIVE_LIVING";
  engine: string;
  inflectionPoint: string;
  metrics: {
    commitIntervalDays: number;
    authorCount: number;
    deletionsRatio: number;
    issueResolutionLatency: number;
  };
  fatalFactors: string[];
  contributors: Contributor[];
  eulogy: string;
  petalsCount: number;
}

interface OfrendaAltarProps {
  initialRepo?: AncestorRepo;
  allRepos: AncestorRepo[];
  onSelectRepo: (repo: AncestorRepo) => void;
}

export default function OfrendaAltar({
  initialRepo,
  allRepos,
  onSelectRepo
}: OfrendaAltarProps) {
  const [activeRepo, setActiveRepo] = useState<AncestorRepo>(
    initialRepo || allRepos[0]
  );
  const [petals, setPetals] = useState<number>(activeRepo?.petalsCount || 42);
  const [candlesLit, setCandlesLit] = useState<boolean>(true);

  const handleOfferPetals = () => {
    setPetals(prev => prev + 1);
  };

  const handleSelect = (repo: AncestorRepo) => {
    setActiveRepo(repo);
    setPetals(repo.petalsCount || 24);
    onSelectRepo(repo);
  };

  const riskPercent = (activeRepo.abandonmentRisk * 100).toFixed(1);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Papel Picado & Altar Head */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs uppercase tracking-widest shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          Día de los Muertos Open-Source Memorial
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-amber-200 bg-clip-text text-transparent">
          DIGITAL OFRENDA ALTAR
        </h1>
        <p className="text-stone-400 text-sm max-w-2xl mx-auto font-mono">
          Honoring the forgotten open-source ancestors whose silent commits built modern cyberspace.
          TabPFN-3.5 mortality diagnosis, Gemma 2 spectral translations, and living tributes.
        </p>
      </div>

      {/* Ancestor Repository Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
        {allRepos.map((repo) => (
          <button
            key={repo.id}
            onClick={() => handleSelect(repo)}
            className={`px-4 py-2 rounded-lg font-mono text-xs transition-all duration-200 flex items-center gap-2 border ${
              activeRepo.id === repo.id
                ? "bg-amber-600/30 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20"
                : "bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200"
            }`}
          >
            <Flower className={`w-3.5 h-3.5 ${activeRepo.id === repo.id ? "text-amber-400 animate-spin" : "text-stone-500"}`} />
            {repo.name}
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
              repo.abandonmentRisk >= 0.70 ? "bg-red-950 text-red-400 border border-red-800/60" : "bg-emerald-950 text-emerald-400"
            }`}>
              {(repo.abandonmentRisk * 100).toFixed(0)}%
            </span>
          </button>
        ))}
      </div>

      {/* Main Altar Stage */}
      <div className="relative border-2 border-amber-500/30 rounded-2xl bg-gradient-to-b from-stone-900/90 via-stone-950 to-black p-6 md:p-10 shadow-2xl overflow-hidden">
        {/* Tiered Altar Steps Graphic */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent pointer-events-none" />

        {/* Candles Row Above Altar */}
        <div className="flex items-center justify-around py-4 border-b border-stone-800/80 mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((candleIndex) => (
            <div key={candleIndex} className="flex flex-col items-center group cursor-pointer" onClick={() => setCandlesLit(!candlesLit)}>
              {candlesLit ? (
                <div className="candle-flame mb-1 transition-transform group-hover:scale-125" />
              ) : (
                <div className="w-1.5 h-3 bg-stone-700 rounded-full mb-1 opacity-50" />
              )}
              <div className="w-4 h-10 bg-gradient-to-b from-amber-100 to-amber-200 rounded-t-sm shadow-md border-t border-amber-300/60" />
              <div className="w-6 h-1 bg-amber-900/60 rounded-full mt-0.5" />
            </div>
          ))}
        </div>

        {/* Center Memorial Frame: The Honored Repository */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Tombstone Frame & Contributor Photos */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative border-2 border-amber-500/60 rounded-xl bg-stone-950/80 p-6 text-center shadow-xl shadow-amber-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-bold font-mono uppercase tracking-wider rounded-full">
                Ancestral Codebase
              </div>

              <div className="w-20 h-20 mx-auto my-3 rounded-full bg-stone-900 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner shadow-amber-500/30">
                🪦
              </div>

              <h2 className="text-2xl font-bold font-mono text-amber-200">{activeRepo.name}</h2>
              <p className="text-xs font-mono text-stone-400 mt-1">{activeRepo.description}</p>
              <div className="text-[11px] font-mono text-amber-500/80 mt-2">
                Active Era: {activeRepo.historicalEra} • Last Heartbeat: {activeRepo.lastActiveYear}
              </div>

              {/* Tribute Marigold Petals Button */}
              <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-center gap-3">
                <button
                  onClick={handleOfferPetals}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition"
                >
                  <Flower className="w-4 h-4 text-stone-950 animate-bounce" />
                  Offer Marigold Petal
                </button>
                <div className="font-mono text-xs text-amber-400">
                  <span className="font-bold text-amber-200">{petals}</span> petals resting
                </div>
              </div>
            </div>

            {/* Contributor Altarpiece (Bus Factor / Historical Authors) */}
            <div className="border border-stone-800 rounded-xl bg-stone-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 border-b border-stone-800 pb-2">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Award className="w-4 h-4" />
                  Preserved Maintainers
                </span>
                <span>Bus Factor: {activeRepo.metrics.authorCount}</span>
              </div>

              <div className="space-y-2">
                {activeRepo.contributors.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-stone-950/70 border border-stone-800/80 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold">#{i + 1}</span>
                      <span className="text-stone-200">{c.name}</span>
                    </div>
                    <div className="text-stone-400 text-[11px]">
                      {c.commits} commits • {c.lastActive}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: TabPFN Mortality Analytics & Spoken Whisper */}
          <div className="lg:col-span-7 space-y-6">
            {/* TabPFN Mortality Diagnosis Card */}
            <div className="border border-amber-600/40 rounded-xl bg-stone-900/70 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-base font-bold text-stone-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    TabPFN-3.5 Mortality Diagnosis
                  </h3>
                  <span className="text-[11px] font-mono text-stone-400">
                    Engine: <strong className="text-amber-400">{activeRepo.engine}</strong>
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-amber-400">
                    {riskPercent}%
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    activeRepo.abandonmentRisk >= 0.70 ? "bg-red-900/60 text-red-300 border border-red-700" : "bg-emerald-900/60 text-emerald-300"
                  }`}>
                    {activeRepo.status}
                  </span>
                </div>
              </div>

              {/* Tabular Metric Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-center font-mono">
                  <Clock className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                  <div className="text-stone-400 text-[10px] uppercase">Commit Gap</div>
                  <div className="text-stone-100 font-bold text-sm">{activeRepo.metrics.commitIntervalDays}d</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-center font-mono">
                  <Users className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                  <div className="text-stone-400 text-[10px] uppercase">Author Cadence</div>
                  <div className="text-stone-100 font-bold text-sm">{activeRepo.metrics.authorCount} dev</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-center font-mono">
                  <GitCommit className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                  <div className="text-stone-400 text-[10px] uppercase">Deletions Ratio</div>
                  <div className="text-stone-100 font-bold text-sm">{(activeRepo.metrics.deletionsRatio * 100).toFixed(1)}%</div>
                </div>

                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-center font-mono">
                  <BookOpen className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                  <div className="text-stone-400 text-[10px] uppercase">Issue Latency</div>
                  <div className="text-stone-100 font-bold text-sm">{activeRepo.metrics.issueResolutionLatency}d</div>
                </div>
              </div>

              {/* Inflection Point Alert */}
              <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-600/30 text-xs font-mono text-amber-200">
                <strong className="text-amber-400">Inflection Point Tipping Alert:</strong> {activeRepo.inflectionPoint}
              </div>

              {/* Contributing Death Factors */}
              <div>
                <div className="text-[11px] font-mono uppercase text-stone-400 tracking-wider mb-2">
                  Diagnosed Causes of Abandonment:
                </div>
                <div className="space-y-1.5">
                  {activeRepo.fatalFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono text-red-300/90 bg-red-950/20 px-3 py-1.5 rounded border border-red-900/40">
                      <span className="text-red-500 font-bold">•</span>
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Terminal Whisper Audio Synthesizer */}
            <TerminalWhisper
              repoName={activeRepo.name}
              whisperText={activeRepo.eulogy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
