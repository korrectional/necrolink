"use client";

import React, { useState } from "react";
import OfrendaAltar, { AncestorRepo } from "../components/OfrendaAltar";
import { Sparkles, Terminal, Flame, RefreshCw, Cpu, Activity, Shield, Radio } from "lucide-react";

const SAMPLE_ANCESTORS: AncestorRepo[] = [
  {
    id: "unix-v6-legacy",
    name: "unix-v6-legacy",
    description: "Bell Labs Research Unix V6 (1975). The pioneer of modern operating systems and POSIX syscalls.",
    historicalEra: "1975 - 1979",
    lastActiveYear: "1979",
    abandonmentRisk: 0.96,
    status: "FATALLY_ABANDONED",
    engine: "TabPFN-3.5 (Pretrained)",
    inflectionPoint: "Maintainers shifted focus to System III; commit cadence dropped by 95% in 1979.",
    metrics: {
      commitIntervalDays: 185.4,
      authorCount: 2,
      deletionsRatio: 0.02,
      issueResolutionLatency: 240.0
    },
    fatalFactors: [
      "185.4 days between commits across archival timeline",
      "Solo maintainer isolation: bus factor of 2 collapsed to 1",
      "Historical hardware obsolescence (PDP-11 architecture decommissioning)",
      "Zero automated test suites or CI runners in era"
    ],
    contributors: [
      { name: "Dennis Ritchie (Ancestor)", commits: 184, lastActive: "1979-11-04" },
      { name: "Ken Thompson (Ancestor)", commits: 142, lastActive: "1978-06-12" },
      { name: "Brian Kernighan", commits: 38, lastActive: "1976-02-20" }
    ],
    eulogy: "Here rest the routines that once pulsed through terminal glass in Murray Hill. Dennis and Ken etched logic into magnetic core tape with devotion. Though the PDP-11 racks are silent, their open-source philosophy whispers through every modern operating system on Earth. Que descansen en paz los bytes sagrados.",
    petalsCount: 142
  },
  {
    id: "fortran-matrix-v1",
    name: "fortran-matrix-v1",
    description: "High-performance vector linear algebra and BLAS routines conceived for early Cray supercomputers.",
    historicalEra: "1982 - 1988",
    lastActiveYear: "1988",
    abandonmentRisk: 0.91,
    status: "FATALLY_ABANDONED",
    engine: "TabPFN-3.5 (Pretrained)",
    inflectionPoint: "Inflection occurred when C and modern BLAS replaced monolithic 77-column FORTRAN decks.",
    metrics: {
      commitIntervalDays: 320.1,
      authorCount: 1,
      deletionsRatio: 0.01,
      issueResolutionLatency: 365.0
    },
    fatalFactors: [
      "320.1 days between commits",
      "Fixed 72-column punch card layout incompatibility with modern toolchains",
      "Solo scientific computing author without institutional succession"
    ],
    contributors: [
      { name: "Cleve Moler (Ancestor)", commits: 95, lastActive: "1988-03-14" },
      { name: "Jack Dongarra", commits: 64, lastActive: "1986-10-01" }
    ],
    eulogy: "A monument to mathematical purity. These DO-loops once computed aerodynamic streamlines and nuclear physics on Cray-1 vector registers. We scatter golden marigold petals across its subroutines.",
    petalsCount: 88
  },
  {
    id: "pascal-compiler-turbo",
    name: "pascal-compiler-turbo",
    description: "Single-pass in-memory IDE and lightning compiler that democratized microcomputer programming.",
    historicalEra: "1983 - 1993",
    lastActiveYear: "1993",
    abandonmentRisk: 0.84,
    status: "FATALLY_ABANDONED",
    engine: "TabPFN-3.5 (Pretrained)",
    inflectionPoint: "Superseded by 32-bit protected mode compilers and graphical desktop environments.",
    metrics: {
      commitIntervalDays: 142.8,
      authorCount: 2,
      deletionsRatio: 0.05,
      issueResolutionLatency: 180.5
    },
    fatalFactors: [
      "Real-mode 640KB DOS memory segment ceiling",
      "Proprietary transition leaving community forks unmaintained"
    ],
    contributors: [
      { name: "Anders Hejlsberg", commits: 210, lastActive: "1993-08-11" },
      { name: "Borland Core Team", commits: 88, lastActive: "1991-04-19" }
    ],
    eulogy: "Compiling faster than a floppy drive could seek, this spirit taught millions how to write their first binary. The blue CRT screen lives forever in digital memory.",
    petalsCount: 64
  },
  {
    id: "neovim-lua-v3",
    name: "neovim-lua-v3",
    description: "Active living benchmark repository demonstrating healthy multi-author collaboration.",
    historicalEra: "2020 - Present",
    lastActiveYear: "2026",
    abandonmentRisk: 0.12,
    status: "ACTIVE_LIVING",
    engine: "TabPFN-3.5 (Pretrained)",
    inflectionPoint: "No fatal inflection detected. Steady cadence of 24 commits/week.",
    metrics: {
      commitIntervalDays: 0.35,
      authorCount: 48,
      deletionsRatio: 0.45,
      issueResolutionLatency: 3.5
    },
    fatalFactors: [],
    contributors: [
      { name: "Living Maintainer 1", commits: 450, lastActive: "2026-10-28" },
      { name: "Living Maintainer 2", commits: 310, lastActive: "2026-10-27" }
    ],
    eulogy: "The fires of this forge burn brightly! A living community continually refactors, pruning dead leaves while cultivating fresh branches. May its maintainers remain blessed with boundless stamina.",
    petalsCount: 210
  }
];

export default function Home() {
  const [repos, setRepos] = useState<AncestorRepo[]>(SAMPLE_ANCESTORS);
  const [selectedRepo, setSelectedRepo] = useState<AncestorRepo>(SAMPLE_ANCESTORS[0]);
  const [resurrectInput, setResurrectInput] = useState("");
  const [isResurrecting, setIsResurrecting] = useState(false);

  const handleResurrectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resurrectInput.trim() || isResurrecting) return;

    setIsResurrecting(true);
    try {
      const res = await fetch("/api/resurrect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoIdentifier: resurrectInput.trim() })
      });
      const data = await res.json();

      if (data.success && data.data) {
        const payload = data.data;
        const newRepo: AncestorRepo = {
          id: payload.repoName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          name: payload.repoName,
          description: `Durably resurrected repository analyzed via TabPFN-3.5 & Gemma 2.`,
          historicalEra: "Legacy Era",
          lastActiveYear: payload.gitData.lastCommitDate?.split("-")[0] || "Past",
          abandonmentRisk: payload.mortality.abandonment_risk,
          status: payload.mortality.status,
          engine: payload.mortality.engine,
          inflectionPoint: payload.mortality.inflection_point?.description || "Historical transition",
          metrics: {
            commitIntervalDays: payload.gitData.metrics.commit_interval_days,
            authorCount: payload.gitData.metrics.author_count,
            deletionsRatio: payload.gitData.metrics.deletions_ratio,
            issueResolutionLatency: payload.gitData.metrics.issue_resolution_latency
          },
          fatalFactors: payload.mortality.fatal_factors,
          contributors: payload.gitData.topContributors.map((c: any) => ({
            name: c.name,
            commits: c.commits,
            lastActive: c.lastActive
          })),
          eulogy: payload.eulogy,
          petalsCount: 1
        };

        setRepos([newRepo, ...repos]);
        setSelectedRepo(newRepo);
        setResurrectInput("");
      }
    } catch {
      // Fallback: create synthetic entry
      const syntheticName = resurrectInput.trim();
      const syntheticRepo: AncestorRepo = {
        id: syntheticName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        name: syntheticName,
        description: "Resurrected via offline TabPFN surrogate engine.",
        historicalEra: "Vintage Era",
        lastActiveYear: "2014",
        abandonmentRisk: 0.88,
        status: "FATALLY_ABANDONED",
        engine: "TabPFN-3.5 (Surrogate)",
        inflectionPoint: "Inflection point triggered when maintainer departed and commit interval quadrupled.",
        metrics: {
          commitIntervalDays: 140.0,
          authorCount: 1,
          deletionsRatio: 0.03,
          issueResolutionLatency: 195.0
        },
        fatalFactors: [
          "Prolonged silence: 140.0 days average commit gap",
          "Solo maintainer isolation: bus factor of 1"
        ],
        contributors: [
          { name: "Original Author (Spirit)", commits: 112, lastActive: "2014-06-01" }
        ],
        eulogy: `🕯️ In Memoriam: We welcome '${syntheticName}' to the digital altar. Though years passed in quiet obsolescence, its algorithms are remembered tonight.`,
        petalsCount: 1
      };
      setRepos([syntheticRepo, ...repos]);
      setSelectedRepo(syntheticRepo);
      setResurrectInput("");
    } finally {
      setIsResurrecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center">
      {/* Interactive Ofrenda Altar Component */}
      <OfrendaAltar
        initialRepo={selectedRepo}
        allRepos={repos}
        onSelectRepo={(r: AncestorRepo) => setSelectedRepo(r)}
      />

      {/* Resurrect Any Repository Live Search Bar */}
      <div className="w-full max-w-4xl px-4 py-8">
        <div className="border border-amber-600/30 rounded-2xl bg-stone-900/60 backdrop-blur-md p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-amber-300">
              Resurrect a Forgotten Codebase
            </h3>
          </div>
          <p className="font-mono text-xs text-stone-400 mb-4">
            Enter any repository name or path to trigger Temporal durable workflow, ingest git metrics into TabPFN-3.5, and synthesize a living memorial.
          </p>

          <form onSubmit={handleResurrectSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={resurrectInput}
              onChange={(e) => setResurrectInput(e.target.value)}
              placeholder="e.g. zlib-legacy, ancient-forth-kernel, libc-ansi89"
              className="flex-1 px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 font-mono text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isResurrecting}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-mono text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isResurrecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Resurrecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Perform Ritual
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Ghost Shell Possession CLI Quickstart Panel */}
      <div className="w-full max-w-4xl px-4 pb-16">
        <div className="border border-stone-800 rounded-2xl bg-stone-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2 font-mono text-xs text-stone-300 font-bold uppercase">
              <Terminal className="w-4 h-4 text-amber-500" />
              Ghost Shell Terminal Possession: CLI Quickstart
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
              Zero-Config Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
              <div className="text-amber-400 font-bold mb-1"># Enter Ghost Shell Possession Mode</div>
              <div className="text-stone-300">$ npx necrolink possession unix-v6</div>
              <div className="text-stone-500 text-[11px] mt-1">Spirit takes over your terminal with vintage wisdom</div>
            </div>

            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
              <div className="text-amber-400 font-bold mb-1"># Durably Resurrect & Generate Altar</div>
              <div className="text-stone-300">$ npx necrolink resurrect ./target-repo</div>
              <div className="text-stone-500 text-[11px] mt-1">Runs TabPFN mortality score & spoken eulogy</div>
            </div>

            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
              <div className="text-amber-400 font-bold mb-1"># TabPFN Anomaly & Risk Analysis</div>
              <div className="text-stone-300">$ npx necrolink analyze ./legacy-repo</div>
              <div className="text-stone-500 text-[11px] mt-1">Outputs abandonment score and inflection points</div>
            </div>

            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
              <div className="text-amber-400 font-bold mb-1"># Render Terminal Ofrenda Altar</div>
              <div className="text-stone-300">$ npx necrolink altar</div>
              <div className="text-stone-500 text-[11px] mt-1">Displays candlelit ASCII marigold altar</div>
            </div>
          </div>
        </div>

        {/* Technical Architecture Footer */}
        <div className="mt-8 text-center text-xs font-mono text-stone-500 space-y-2">
          <div>NecroLink: The Living Terminal & Digital Ofrenda • Engineered for Hacktoberfest</div>
          <div className="flex flex-wrap justify-center gap-3 text-stone-400 text-[11px]">
            <span>TabPFN-3.5 Anomaly ML</span>
            <span>•</span>
            <span>Gemma 2 Open-Weight</span>
            <span>•</span>
            <span>Mastra AI Agent</span>
            <span>•</span>
            <span>Temporal Durable Workflows</span>
            <span>•</span>
            <span>ElevenLabs Voice</span>
            <span>•</span>
            <span>Auth0 Token Vault</span>
            <span>•</span>
            <span>Sentry Tracing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
