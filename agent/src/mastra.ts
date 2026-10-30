/**
 * Mastra Agent Orchestrator & Harness
 * Unites local Gemma 2 intelligence, TabPFN mortality analysis, Git extraction,
 * Browserbase archival scraping, and in-memory session persistence.
 */

import { gemma, GemmaProvider, SPECTRAL_SYSTEM_PROMPT } from "./gemmaProvider.js";
import { telemetry } from "./telemetry.js";
import { tabpfnTool, runTabPFNAnalysis, TabPFNResult } from "./tools/tabpfnTool.js";
import { gitParserTool, parseGitRepository, ExtractedGitData } from "./tools/gitParserTool.js";
import { browserbaseTool, fetchHistoricalContext, ArchivalContextResult } from "./tools/browserbaseTool.js";

export interface InspectedRepoRecord {
  repoName: string;
  analyzedAt: string;
  mortality: TabPFNResult;
  gitData: ExtractedGitData;
  archives: ArchivalContextResult;
  eulogy: string;
  tributePetalsOffered: number;
}

export class AgentMemoryStore {
  private history: Map<string, InspectedRepoRecord> = new Map();
  private conversationTurns: Array<{ role: "user" | "spirit"; message: string; timestamp: string }> = [];

  public saveInspection(record: InspectedRepoRecord) {
    this.history.set(record.repoName.toLowerCase(), record);
  }

  public getInspection(repoName: string): InspectedRepoRecord | undefined {
    return this.history.get(repoName.toLowerCase());
  }

  public listInspected(): InspectedRepoRecord[] {
    return Array.from(this.history.values());
  }

  public recordTurn(role: "user" | "spirit", message: string) {
    this.conversationTurns.push({ role, message, timestamp: new Date().toISOString() });
    if (this.conversationTurns.length > 50) {
      this.conversationTurns.shift();
    }
  }

  public getRecentTurns(limit: number = 10) {
    return this.conversationTurns.slice(-limit);
  }
}

export class NecroLinkAgent {
  public memory: AgentMemoryStore;
  public gemma: GemmaProvider;

  constructor() {
    this.memory = new AgentMemoryStore();
    this.gemma = gemma;
  }

  /**
   * Orchestrates the complete resurrection and memorial pipeline for a repository.
   */
  public async resurrectRepository(repoPathOrName: string): Promise<InspectedRepoRecord> {
    return telemetry.traceSpan(
      { op: "agent.resurrect", name: "Resurrect_Repository_Orchestration", data: { target: repoPathOrName } },
      async () => {
        // Check memory cache first
        const cached = this.memory.getInspection(repoPathOrName);
        if (cached) return cached;

        // Step 1: Extract Git Cadence & Authors
        const gitData = await parseGitRepository(repoPathOrName);

        // Step 2: TabPFN Mortality & Inflection Point Analysis
        const mortality = await runTabPFNAnalysis(gitData.repoName, gitData.metrics);

        // Step 3: Archival Mailing List & Obsolete Thread Retrieval
        const archives = await fetchHistoricalContext(gitData.repoName);

        // Step 4: Spectral Memorial Generation via Gemma 2
        const eulogy = await this.gemma.generateMemorialEpitaph(gitData.repoName, gitData.metrics);

        const record: InspectedRepoRecord = {
          repoName: gitData.repoName,
          analyzedAt: new Date().toISOString(),
          mortality,
          gitData,
          archives,
          eulogy,
          tributePetalsOffered: 1
        };

        this.memory.saveInspection(record);
        return record;
      }
    );
  }

  /**
   * Conversational possession interaction with the spirit of the shell.
   */
  public async chat(userMessage: string, contextRepo?: string): Promise<string> {
    this.memory.recordTurn("user", userMessage);

    let systemContext = SPECTRAL_SYSTEM_PROMPT;
    if (contextRepo) {
      const info = this.memory.getInspection(contextRepo);
      if (info) {
        systemContext += `\nYou are currently manifesting within the deceased repository '${info.repoName}'. Abandonment risk: ${(info.mortality.abandonment_risk * 100).toFixed(1)}%. Primary cause of death: ${info.mortality.fatal_factors.join(", ") || "maintainer silence"}.`;
      }
    }

    const response = await this.gemma.generate(userMessage, { systemPrompt: systemContext });
    this.memory.recordTurn("spirit", response.content);
    return response.content;
  }
}

export const necroAgent = new NecroLinkAgent();
