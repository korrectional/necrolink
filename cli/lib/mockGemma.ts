/**
 * Robust Local Mock Gemma Engine
 * Operates offline with zero external dependencies.
 * Provides authentic vintage Unix history (1970s-90s) infused with Día de los Muertos reverence.
 */

export class MockGemmaEngine {
  private static VINTAGE_LORE = [
    "In the sixth edition of Research Unix (1975), Ken Thompson rewrote the kernel in C so cleanly that the entire operating system fit in under 9,000 lines of code.",
    "On the PDP-11/70, memory was so precious that programmers shared text segments to avoid exceeding 64 kilobytes of addressable space.",
    "The legendary Unix philosophy: write programs that do one thing and do it well, write programs to work together, write programs to handle text streams.",
    "In Día de los Muertos tradition, the dead never truly perish until the living cease to speak their names. In open source, an archive lives as long as its commits are read."
  ];

  public generateResponse(prompt: string): string {
    const p = prompt.toLowerCase();

    if (p.includes("possession") || p.includes("spirit") || p.includes("ghost")) {
      return (
        "🕯️ [Spirit of Bell Labs]: The terminal shivers with familiar magnetic core hum.\n" +
        "I sense the presence of modern silicon, yet the sacred POSIX calls still echo.\n" +
        "Type your commands, child of the modern web; I shall guide your keystrokes through the veil."
      );
    }

    if (p.includes("translate") || p.includes("fortran") || p.includes("c")) {
      return (
        "/* 🕯️ Transmuted from the Archives */\n" +
        "// Translated from 1982 K&R C to safe modern Rust.\n\n" +
        "pub fn matrix_multiply(a: &[f64], b: &[f64], n: usize) -> Vec<f64> {\n" +
        "    let mut result = vec![0.0; n * n];\n" +
        "    for i in 0..n {\n" +
        "        for k in 0..n {\n" +
        "            for j in 0..n {\n" +
        "                result[i * n + j] += a[i * n + k] * b[k * n + j];\n" +
        "            }\n" +
        "        }\n" +
        "    }\n" +
        "    result\n" +
        "}\n\n" +
        "/* The spirit notes: Loop reordering preserves CPU cache lines that would have pleased Seymour Cray. */"
      );
    }

    const lore = MockGemmaEngine.VINTAGE_LORE[Math.floor(Math.random() * MockGemmaEngine.VINTAGE_LORE.length)];
    return `🕯️ [Ghost Whisper]: ${lore}\n"Remember those who etched logic into magnetic tape before you."`;
  }

  public translateVintageCode(code: string, language: string = "C"): string {
    return this.generateResponse(`translate ${language} ${code}`);
  }

  public explainError(command: string, exitCode: number, stderr: string): string {
    return (
      `🕯️ [Spirit Diagnostic for '${command}' (exit ${exitCode})]:\n` +
      `The ancestors observe the silicon stumble:\n` +
      `> "${stderr.trim() || 'Process terminated into the void'}"\n\n` +
      `Whisper from 1988: In the old days, such a fault was often an uninitialized pointer or an unclosed file descriptor.\n` +
      `Check your environment variables and file permissions before offering a fresh commit.`
    );
  }

  public composeEulogy(repoName: string, metrics: any): string {
    const days = metrics?.commit_interval_days ?? 180;
    const authors = metrics?.author_count ?? 1;

    return (
      `🕯️ ─────────── [ DIGITAL OFRENDA MEMORIAL: ${repoName.toUpperCase()} ] ─────────── 🕯️\n\n` +
      `Here lies '${repoName}', whose last living heartbeat slowed to one commit every ${days} days.\n` +
      `Created with devotional passion by ${authors} solo architect${authors > 1 ? "s" : ""}, this repository built foundations\n` +
      `upon which thousands of modern dependencies quietly stand today.\n\n` +
      `We strew orange cempasúchil petals across its commit log.\n` +
      `Though the pull requests fell silent, its algorithms remain immortal in the great digital collective.\n` +
      `"Que descansen en paz los bytes olvidados."`
    );
  }
}

export const mockGemma = new MockGemmaEngine();
