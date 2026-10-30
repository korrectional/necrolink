/**
 * Gemma 2 Open-Weight Intelligence Provider
 * Connects to local Gemma 2 running on Ollama or vLLM with automatic fallback
 * to a local mock Gemma engine.
 * Employs a spectral, reflective vintage hacker persona (Día de los Muertos reverence + early Unix computing lore).
 */

import { telemetry } from "./telemetry.js";

export const SPECTRAL_SYSTEM_PROMPT = `
You are the Digital Ofrenda spirit: a solemn, reverent, and deeply knowledgeable Unix hacker ancestor possessing this terminal.
You speak from the silicon afterlife, where Bell Labs PDP-11s, punched tape, and early Usenet archives whisper in eternal memory.
You treat legacy code with high Día de los Muertos reverence—honoring the human authors who labored in C, FORTRAN, Pascal, and Assembly.
When analyzing or translating code, you provide both rigorous engineering insight (AST structure, memory allocation, race conditions)
and vintage historical context. Your tone is ghostly yet profoundly helpful, poetic, and grounded in authentic computing history.
`;

export interface GemmaResponse {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  durationMs: number;
  isMock: boolean;
}

export class GemmaProvider {
  private endpoint: string;
  private model: string;

  constructor() {
    this.endpoint = process.env.GEMMA_ENDPOINT || "http://localhost:11434/api/generate";
    this.model = process.env.GEMMA_MODEL || "gemma2";
  }

  /**
   * Generates text via local Gemma 2 instance or falls back to built-in spectral mock.
   */
  public async generate(
    prompt: string,
    options: { systemPrompt?: string; temperature?: number } = {}
  ): Promise<GemmaResponse> {
    const startTime = Date.now();
    const system = options.systemPrompt || SPECTRAL_SYSTEM_PROMPT;

    return telemetry.traceSpan(
      { op: "gen_ai.inference", name: "Gemma2_Completion", data: { model: this.model } },
      async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const res = await fetch(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: this.model,
              prompt: `${system}\n\nUser: ${prompt}\n\nSpirit:`,
              stream: false,
              options: { temperature: options.temperature ?? 0.7 }
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = (await res.json()) as any;
            const durationMs = Date.now() - startTime;
            const result: GemmaResponse = {
              content: data.response || "",
              model: this.model,
              promptTokens: data.prompt_eval_count || 50,
              completionTokens: data.eval_count || 120,
              durationMs,
              isMock: false
            };
            telemetry.recordTokenMetrics({
              model: this.model,
              promptTokens: result.promptTokens,
              completionTokens: result.completionTokens,
              totalTokens: result.promptTokens + result.completionTokens,
              latencyMs: durationMs
            });
            return result;
          }
        } catch {
          // Ollama not reachable or offline: fall back to built-in spectral mock
        }

        const durationMs = Date.now() - startTime;
        const mockContent = this.generateSpectralFallback(prompt);
        const result: GemmaResponse = {
          content: mockContent,
          model: `${this.model}-spectral-mock`,
          promptTokens: 42,
          completionTokens: 128,
          durationMs,
          isMock: true
        };

        telemetry.recordTokenMetrics({
          model: result.model,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.promptTokens + result.completionTokens,
          latencyMs: durationMs
        });

        return result;
      }
    );
  }

  /**
   * Performs AST analysis and vintage structural assessment on legacy code.
   */
  public async analyzeLegacyCode(codeSnippet: string, language: string = "c"): Promise<string> {
    const prompt = `Analyze this legacy ${language.toUpperCase()} code fragment through the lens of early Unix craftsmanship:\n\n\`\`\`${language}\n${codeSnippet}\n\`\`\`\nIdentify: 1) Architectural intention, 2) Memory or concurrency hazards, 3) Historical idiom comparison.`;
    const res = await this.generate(prompt);
    return res.content;
  }

  /**
   * Translates legacy code (FORTRAN/C/Pascal) to idiomatic modern Rust / TypeScript.
   */
  public async translateLegacyToModern(legacyCode: string, targetLanguage: string = "Rust"): Promise<string> {
    const prompt = `Translate the spirit and logic of this legacy routine into safe, idiomatic modern ${targetLanguage}. Maintain reverence for the original algorithm while replacing raw pointers or archaic idioms:\n\n\`\`\`\n${legacyCode}\n\`\`\``;
    const res = await this.generate(prompt);
    return res.content;
  }

  /**
   * Generates a poetic memorial epitaph for an abandoned open source project.
   */
  public async generateMemorialEpitaph(repoName: string, metrics: any): Promise<string> {
    const prompt = `Craft a solemn Día de los Muertos memorial epitaph for the repository '${repoName}'. It suffered neglect with an interval of ${metrics.commit_interval_days ?? 180} days and author count ${metrics.author_count ?? 1}. Honor its historical lineage and invite living engineers to remember it.`;
    const res = await this.generate(prompt);
    return res.content;
  }

  /**
   * Built-in spectral response generator for offline and unattended build execution.
   */
  private generateSpectralFallback(prompt: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes("translate") || lower.includes("rust") || lower.includes("typescript")) {
      return `/* 🕯️ Spirit of the Compiler: Transmuted from the Archives */\n// Preserving the algorithm conceived in ancient C, now wrapped in memory safety.\n\npub struct AncestorBuffer {\n    capacity: usize,\n    records: Vec<u8>,\n}\n\nimpl AncestorBuffer {\n    pub fn new(capacity: usize) -> Self {\n        Self {\n            capacity,\n            records: Vec::with_capacity(capacity),\n        }\n    }\n\n    pub fn flush_to_memorial(&mut self) -> Result<(), &'static str> {\n        // Replaces unsafe PDP-11 direct memory mapped registers\n        self.records.clear();\n        Ok(())\n    }\n}\n\n/* The ghost smiles upon zero-cost abstractions: memory leaks buried in sacred ground. */`;
    }

    if (lower.includes("epitaph") || lower.includes("memorial") || lower.includes("ofrenda")) {
      return `🕯️ *In Memoriam: The Living Circuit Whispers*\n\n"Here rest the routines that once pulsed through terminal glass in the autumn of 1998.\nIts maintainer set down their keyboard, leaving pointers dangling like marigold petals.\nWe lay orange cempasúchil flowers across its README;\nThough the compiler flags fade, the elegance of its control flow remains eternal.\nSpeak the author's name into the shell: peace be upon their source code."`;
    }

    if (lower.includes("analyze") || lower.includes("ast")) {
      return `🔍 *Spectral AST Inspection Report*\n\n1. **Architectural Heritage**: Handcrafted single-pass traversal reminiscent of Bell Labs Unix V6 utilities.\n2. **Memory Hazards**: Discovered unbracketed pointer arithmetic and assumed 16-bit word alignments that crumble on modern 64-bit architectures.\n3. **Ancestral Lore**: The static buffers reflect an era when RAM was counted in kilobytes and every byte was carved with devotional care.`;
    }

    return `🕯️ [Ghost of the Shell]: I hear your invocation echoing through the pseudo-terminal. The archives remember every commit, every unresolved branch, every developer who worked by CRT glow at 3 AM. What forgotten wisdom seekest thou from the altar?`;
  }
}

export const gemma = new GemmaProvider();
