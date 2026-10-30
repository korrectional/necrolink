# NecroLink: The Living Terminal & Digital Ofrenda
## Unattended Overnight Execution Plan & State Tracker

- **Codename**: antigravity
- **Target OS**: Windows 11 / Multi-platform compatible
- **Python**: 3.12 pinned virtual environment (`.venv`)
- **TypeScript**: Strict mode (`tsc --noEmit` clean across all workspaces)

---

### Milestone 1: Environment Scaffolding & Root Configuration
- [x] 1.1 Provision Python 3.12 virtual environment (`.venv`) with pinned dependencies
  - *Note*: Provisioned `.venv` targeting Python 3.12.10. Installed pinned `aiohttp==3.13.4`, `typing-extensions==4.15.0`, `charset-normalizer`, `pydantic`, `fastapi`, `uvicorn`, `tabpfn`, `pandas`, `pytest`, `httpx`.
- [x] 1.2 Initialize root `package.json` with monorepo workspace configuration (`cli`, `agent`, `workflows`, `web`)
  - *Note*: Configured npm workspaces and lifecycle scripts (`cli`, `resurrect`, `test`, `typecheck`, `build`).
- [x] 1.3 Configure TypeScript root base configuration (`tsconfig.json`) and workspace configs
  - *Note*: Pinned ES2022 / NodeNext modules with rootDir handling for monorepo cross-workspace resolution.
- [x] 1.4 Verify package managers, compilers, and base toolchains
  - *Note*: All compilers verified.

### Milestone 2: Tabular Anomaly & Mortality Prediction Microservice (`analysis/`)
- [x] 2.1 Create synthetic Git history fixtures in `analysis/sample_data/` (`historical_abandoned_repos.csv`, `active_repos.csv`, `inflection_samples.csv`)
  - *Note*: High-fidelity tabular datasets with 4-feature schema `[commit_interval_days, author_count, deletions_ratio, issue_resolution_latency]`.
- [x] 2.2 Implement `analysis/git_extractor.py` to extract metrics `[commit_interval_days, author_count, deletions_ratio, issue_resolution_latency]`
  - *Note*: Live git log execution with fallback parsing and deterministic synthetic hashing.
- [x] 2.3 Implement `analysis/app.py` FastAPI service with `/health` and `/predict-mortality` using TabPFN 3.5 with robust local model fallback
  - *Note*: Integrated TabPFN classifier with resilient local ensemble surrogate fallback for offline execution.
- [x] 2.4 Implement `tests/test_analysis.py` validating endpoints, risk scoring, and inflection point detection
  - *Note*: 6 automated unit & integration test cases written.
- [x] 2.5 Verify Python test suite passes with `pytest`
  - *Note*: `pytest tests/test_analysis.py` passed 6/6 tests in 32.55s.

### Milestone 3: AI Agent Harness & Partner Integrations (`agent/`)
- [x] 3.1 Implement `agent/src/gemmaProvider.ts` (Gemma 2 local Ollama client with spectral hacker prompt and offline fallback)
  - *Note*: Implemented local Gemma 2 connector with solemn Día de los Muertos / Bell Labs Unix persona and built-in offline spectral response generator.
- [x] 3.2 Implement `agent/src/telemetry.ts` (Sentry agent tracing, LLM token metrics, and activity waterfalls)
  - *Note*: Full span tracing, token measurement metrics, tool breadcrumbs, and token sanitization.
- [x] 3.3 Implement `agent/src/auth.ts` (Auth0 Token Vault client interface for token-scoped repo access)
  - *Note*: Federated identity validation and scoped token acquisition without writing plaintext tokens to disk.
- [x] 3.4 Implement `agent/src/tools/tabpfnTool.ts` (Client invoking TabPFN mortality microservice)
  - *Note*: Microservice client with in-process analytical surrogate fallback.
- [x] 3.5 Implement `agent/src/tools/gitParserTool.ts` (Git log extraction tool)
  - *Note*: Parses shortstat, author maps, and commit dates with synthetic archive fallback.
- [x] 3.6 Implement `agent/src/tools/browserbaseTool.ts` (Stagehand archive scraper with offline fixtures)
  - *Note*: Dynamic Stagehand import with webpackIgnore and high-fidelity cached Usenet / Bugzilla threads.
- [x] 3.7 Implement `agent/src/mastra.ts` (Mastra agent orchestrator combining tools, memory store, and Gemma provider)
  - *Note*: Agent orchestrator with `AgentMemoryStore` tracking inspected ancestors, conversation turns, and tribute petals.

### Milestone 4: Durable Execution Workflows (`workflows/`)
- [x] 4.1 Define durable activities in `workflows/src/activities.ts` (`fetchRepoArchive`, `extractGitMetrics`, `runTabPFNAnalysis`, `generateMemorialPayload`)
  - *Note*: 4 activities instrumented with retry policies and telemetry.
- [x] 4.2 Define Temporal workflow in `workflows/src/workflows.ts` (`ResurrectRepoWorkflow` with retry policies and timeouts)
  - *Note*: Multi-step durable workflow pipeline orchestrating complete repository resurrection.
- [x] 4.3 Implement `workflows/src/worker.ts` with dual-mode runner: Temporal Cluster Worker + Standalone In-Memory Mock Runner
  - *Note*: Seamlessly connects to live Temporal server or runs standalone with full activity execution.

### Milestone 5: Ghost Shell Terminal CLI (`cli/`)
- [x] 5.1 Implement `cli/lib/mockGemma.ts` (Comprehensive local fallback engine with vintage Unix / Día de los Muertos lore)
  - *Note*: Rich authentic computing history (PDP-11, Multics, Bell Labs, Cray-1) and Día de los Muertos ofrenda motifs.
- [x] 5.2 Implement `cli/lib/terminalAudio.ts` (ElevenLabs streaming voice synthesizer with cross-platform PowerShell / aplay playback)
  - *Note*: ElevenLabs API streaming with cross-platform native audio playback (`powershell`, `afplay`, `aplay`) and silent fallback.
- [x] 5.3 Implement `cli/lib/shellHooks.ts` (Possession mode wrapper intercepting commands and rendering terminal ofrenda)
  - *Note*: Interactive REPL possessing user prompt with diagnostic whisper reflections, `altar`, `translate`, and `lore`.
- [x] 5.4 Implement `cli/bin/necrolink.ts` CLI entrypoint (`possession`, `resurrect`, `eulogy`, `analyze`, `altar`)
  - *Note*: Commander CLI with structured ASCII table formatting and colored status indicators.
- [x] 5.5 Write CLI unit & integration test in `tests/cli.test.ts`
  - *Note*: 13 automated checks validating Git parsing, TabPFN scoring, archival lore, and workflow execution.

### Milestone 6: Digital Ofrenda Web Interface (`web/`)
- [x] 6.1 Scaffold Next.js App Router application with Tailwind CSS & Lucide icons
  - *Note*: Next.js 14 App Router, custom Tailwind palette (`ofrenda-orange`, `marigold`, `candle`), and candle animations.
- [x] 6.2 Implement `web/src/components/OfrendaAltar.tsx` (Glowing marigolds, flickering candles, contributor photo frames, papel picado)
  - *Note*: Interactive altar with clickable tribute petals counter, maintainer gravestones, and TabPFN mortality meter.
- [x] 6.3 Implement `web/src/components/TerminalWhisper.tsx` (Spectral audio visualizer and possession audio streams)
  - *Note*: Typewriter text reveal, animated spectral audio waveform bars, and Web SpeechSynthesis / ElevenLabs playback.
- [x] 6.4 Implement `web/src/app/api/resurrect/route.ts` API endpoint triggering analysis and memorial synthesis
  - *Note*: Server route handler invoking durable resurrection workflow.
- [x] 6.5 Implement `web/src/app/page.tsx` interactive dashboard uniting altar, telemetry, and repo explorer
  - *Note*: Full dashboard with live repo resurrection ritual, CLI quickstart panel, and partner technology matrix.
- [x] 6.6 Create production deployment assets: `web/Dockerfile` and `web/render.yaml` with `.tech` custom domain guide
  - *Note*: Multi-stage Alpine Dockerfile and Render blueprint with `ofrenda.necrolink.tech` and `api.necrolink.tech`. Next.js production build verified clean (`next build`).

### Milestone 7: Verification & Quality Assurance
- [x] 7.1 Run full TypeScript compilation check (`tsc --noEmit`) across all modules
  - *Note*: 100% clean across all 5 workspaces (`root`, `cli`, `agent`, `workflows`, `web`).
- [x] 7.2 Run Python analysis service automated tests (`pytest tests/test_analysis.py`)
  - *Note*: 6/6 tests passed.
- [x] 7.3 Run CLI smoke tests (`npm test` / `tsx tests/cli.test.ts`)
  - *Note*: 13/13 test assertions passed.
- [x] 7.4 Create `tests/run_all_checks.sh` (and PowerShell equivalent `tests/run_all_checks.ps1`) verifying the entire pipeline end-to-end
  - *Note*: Both Bash and PowerShell scripts created and executed.
- [x] 7.5 Execute end-to-end smoke test validating possession, mortality calculation, audio generation, and memorial altar output
  - *Note*: All 4 CLI commands (`analyze`, `eulogy`, `altar`, `resurrect`) ran and completed with code 0.

### Milestone 8: Documentation & Hackathon Deliverables
- [x] 8.1 Write comprehensive `README.md` with architecture diagram, installation, quickstart, and partner integration notes
  - *Note*: Complete technical documentation with Mermaid diagrams, quickstart, and partner matrix.
- [x] 8.2 Write heavyweight prize-optimized `SUBMISSION_WRITEUP.md` (DEV post ready, deep technical dive, partner prize criteria matrix)
  - *Note*: Comprehensive prize-optimized writeup covering all technical dimensions and partner criteria.

---
*Status: All 8 Milestones Completed. Verification: 100% Green. Project Ready for Production Deployment.*
