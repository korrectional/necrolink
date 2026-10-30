/**
 * Ghost Shell Possession Mode & Interactive Terminal Wrapper
 * Possesses the developer's terminal, whispering vintage architectural lore,
 * syntactic translations, and Día de los Muertos reverence between commands.
 */

import readline from "node:readline";
import { exec } from "node:child_process";
import chalk from "chalk";
import { mockGemma } from "./mockGemma.js";
import { terminalAudio } from "./terminalAudio.js";

export class GhostShellSession {
  private repoName: string;
  private rl?: readline.Interface;
  private isPossessed: boolean = true;

  constructor(repoName: string = "ancient-unix-v6") {
    this.repoName = repoName;
  }

  public renderPossessionBanner() {
    console.log(chalk.yellow(`
  ╔════════════════════════════════════════════════════════════════════════╗
  ║    🕯️   N E C R O L I N K   :   G H O S T   S H E L L   🕯️            ║
  ║         Possessed by the Spirit of: ${this.repoName.padEnd(31)}║
  ╚════════════════════════════════════════════════════════════════════════╝
`));
    console.log(chalk.gray(`  [Type commands to execute in shell, or: 'altar', 'lore', 'translate', 'exorcise']\n`));
  }

  public async startInteractiveSession() {
    this.renderPossessionBanner();
    await terminalAudio.speakText(`The terminal is possessed by the spirit of ${this.repoName}.`);

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.hex("#FF7518")(`🕯️ [${this.repoName}] ❯ `)
    });

    this.rl.prompt();

    this.rl.on("line", async (line) => {
      const input = line.trim();

      if (!input) {
        this.rl?.prompt();
        return;
      }

      if (input === "exorcise" || input === "exit" || input === "quit") {
        console.log(chalk.yellow("\n🕯️ The spirit releases its hold upon your terminal. Rest in peace, living hacker.\n"));
        await terminalAudio.speakText("The spirit returns to the archives.");
        this.rl?.close();
        return;
      }

      if (input === "altar" || input === "ofrenda") {
        this.displayTerminalOfrenda();
        this.rl?.prompt();
        return;
      }

      if (input === "lore") {
        const lore = mockGemma.generateResponse("lore");
        console.log(chalk.hex("#E5A93C")(`\n${lore}\n`));
        this.rl?.prompt();
        return;
      }

      if (input.startsWith("translate")) {
        const code = input.replace("translate", "").trim() || "int i; for(i=0; i<10; i++) { *p++ = 0; }";
        const translation = mockGemma.translateVintageCode(code, "C");
        console.log(chalk.hex("#38BDF8")(`\n${translation}\n`));
        this.rl?.prompt();
        return;
      }

      // Execute normal shell command under possession observation
      this.executePossessedCommand(input);
    });

    this.rl.on("close", () => {
      process.exit(0);
    });
  }

  private executePossessedCommand(command: string) {
    exec(command, (error, stdout, stderr) => {
      if (stdout) {
        process.stdout.write(stdout);
      }
      if (stderr) {
        process.stderr.write(chalk.red(stderr));
      }

      // Spirit whispering reflection
      if (error) {
        const diagnostic = mockGemma.explainError(command, error.code || 1, stderr || error.message);
        console.log(chalk.hex("#F59E0B")(`\n${diagnostic}\n`));
        terminalAudio.speakText("A fault in the silicon. The ancestors remember this error.");
      } else {
        const whispers = [
          "The spirit nods in silent approval. The bytes flowed true.",
          "Registers cleared without complaint. Ken Thompson would approve.",
          "A clean return code. Another petal added to the digital altar."
        ];
        const whisper = whispers[Math.floor(Math.random() * whispers.length)];
        console.log(chalk.hex("#B45309")(`  🕯️ ${whisper}`));
      }

      this.rl?.prompt();
    });
  }

  public displayTerminalOfrenda() {
    console.log(chalk.hex("#FF7518")(`
                 🕯️  DIGITAL OFRENDA ALTAR  🕯️
       _________________________________________________
      |                                                 |
      |   [ Cempasúchil Marigolds ]     [ Pan de Muerto]|
      |                                                 |
      |          ┌───────────────────────────┐          |
      |          │ 🪦  ${this.repoName.padEnd(21)} │          |
      |          │    Preserved in Memoriam  │          |
      |          │    Author: Dennis & Ken   │          |
      |          └───────────────────────────┘          |
      |                                                 |
      |    🕯️  Candle of Living Memory: BURNING          |
      |    📜  Sacred Commits Preserved: 1,842          |
      |_________________________________________________|
    `));
  }
}
