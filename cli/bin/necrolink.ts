#!/usr/bin/env node
/**
 * NecroLink CLI: The Living Terminal & Digital Ofrenda Entrypoint
 * Command-line tool bridging forgotten open-source repositories and living memory.
 */

import { Command } from "commander";
import chalk from "chalk";
import Table from "cli-table3";
import { GhostShellSession } from "../lib/shellHooks.js";
import { mockGemma } from "../lib/mockGemma.js";
import { terminalAudio } from "../lib/terminalAudio.js";
import { runTabPFNAnalysis } from "../../agent/src/tools/tabpfnTool.js";
import { parseGitRepository } from "../../agent/src/tools/gitParserTool.js";
import { runStandaloneWorkflow } from "../../workflows/src/worker.js";
import { processGitHubWebhook } from "../../agent/src/tools/githubWebhookTool.js";

const program = new Command();

program
  .name("necrolink")
  .description("NecroLink: The Living Terminal & Digital Ofrenda for Open-Source Ancestors")
  .version("1.0.0");

// 1. Possession Mode Command
program
  .command("possession")
  .description("Possesses your terminal with the spirit of an archived or legacy codebase")
  .argument("[repo]", "Target repository name or path to inhabit", "unix-v6-legacy")
  .action(async (repo) => {
    const session = new GhostShellSession(repo);
    await session.startInteractiveSession();
  });

// 2. Resurrect Repository Command (Durable Workflow)
program
  .command("resurrect")
  .description("Durably resurrects a repository: analyzes mortality, fetches lore, and builds an altar")
  .argument("<target>", "Path or identifier of repository to resurrect")
  .option("--silent", "Disable spoken spectral audio")
  .action(async (target, options) => {
    console.log(chalk.yellow(`\n🕯️ [NecroLink] Commencing Resurrection Ritual for: ${chalk.bold(target)}...`));
    
    try {
      const memorial = await runStandaloneWorkflow({ repoIdentifier: target });

      console.log(chalk.hex("#FF7518")(`\n╔══════════════════════════════════════════════════════════════════════╗`));
      console.log(chalk.hex("#FF7518")(`║               🕯️  D I G I T A L   O F R E N D A  🕯️                 ║`));
      console.log(chalk.hex("#FF7518")(`╚══════════════════════════════════════════════════════════════════════╝\n`));

      console.log(chalk.bold.white(`Repository Ancestor: `) + chalk.cyan(memorial.repoName));
      console.log(chalk.bold.white(`Abandonment Risk:    `) + (
        memorial.mortality.abandonment_risk >= 0.70
          ? chalk.red(`${(memorial.mortality.abandonment_risk * 100).toFixed(1)}% [FATALLY ABANDONED]`)
          : chalk.green(`${(memorial.mortality.abandonment_risk * 100).toFixed(1)}% [ACTIVE LIVING]`)
      ));
      console.log(chalk.bold.white(`ML Prediction Engine:`) + chalk.magenta(` ${memorial.mortality.engine}`));
      console.log(chalk.bold.white(`Inflection Point:    `) + chalk.yellow(memorial.mortality.inflection_point?.description || "N/A"));

      // Table of Tabular Metrics
      const table = new Table({
        head: [chalk.cyan("Metric"), chalk.cyan("Observed Value"), chalk.cyan("Survival Status")],
        colWidths: [30, 20, 24]
      });

      const m = memorial.gitData.metrics;
      table.push(
        ["Commit Interval (days)", `${m.commit_interval_days} d`, m.commit_interval_days > 60 ? chalk.red("Critically Slow") : chalk.green("Healthy Cadence")],
        ["Active Author Count", `${m.author_count}`, m.author_count <= 1 ? chalk.red("Bus Factor = 1") : chalk.green("Collaborative")],
        ["Deletions Ratio", `${(m.deletions_ratio * 100).toFixed(1)}%`, m.deletions_ratio < 0.05 ? chalk.yellow("Low Refactoring") : chalk.green("Balanced")],
        ["Issue Resolution Delay", `${m.issue_resolution_latency} d`, m.issue_resolution_latency > 90 ? chalk.red("Backlog Freeze") : chalk.green("Responsive")]
      );
      console.log(`\n${table.toString()}\n`);

      // Eulogy
      console.log(chalk.hex("#E5A93C")(`📜 Memorial Eulogy:\n${memorial.eulogy}\n`));

      // Spoken Audio
      if (!options.silent) {
        await terminalAudio.speakText(`We honor the spirit of ${memorial.repoName}. May its commits rest in peace.`);
      }
    } catch (err: any) {
      console.error(chalk.red(`Resurrection failed: ${err.message}`));
      process.exit(1);
    }
  });

// 3. TabPFN Anomaly & Mortality Analysis Command
program
  .command("analyze")
  .description("Calculates abandonment risk score and detects fatal inflection points via TabPFN-3.5")
  .argument("<target>", "Repository path or name")
  .action(async (target) => {
    console.log(chalk.cyan(`\n🔍 Ingesting Git log metrics for '${target}' into TabPFN-3.5...`));
    const gitData = await parseGitRepository(target);
    const result = await runTabPFNAnalysis(gitData.repoName, gitData.metrics);

    console.log(chalk.bold(`\nAbandonment Risk: `) + chalk.yellow(`${(result.abandonment_risk * 100).toFixed(1)}%`));
    console.log(chalk.bold(`Status:           `) + chalk.magenta(result.status));
    console.log(chalk.bold(`Inflection Point: `) + chalk.cyan(result.inflection_point?.description || "None"));
    console.log(chalk.bold(`Fatal Factors:`));
    result.fatal_factors.forEach(f => console.log(chalk.red(`  • ${f}`)));
  });

// 4. Poetic Memorial Eulogy Command
program
  .command("eulogy")
  .description("Generates a poetic Día de los Muertos eulogy using local Gemma 2")
  .argument("<target>", "Repository name")
  .action(async (target) => {
    const gitData = await parseGitRepository(target);
    const eulogy = mockGemma.composeEulogy(target, gitData.metrics);
    console.log(chalk.hex("#FF7518")(`\n${eulogy}\n`));
  });

// 5. Digital Ofrenda Altar Command
program
  .command("altar")
  .description("Renders the glowing candlelit ofrenda altar for open-source ancestors")
  .action(() => {
    const session = new GhostShellSession("open-source-ancestors");
    session.displayTerminalOfrenda();
  });

// 6. Simulate GitHub Archive Webhook Command
program
  .command("simulate-archive")
  .description("Simulates an incoming GitHub repository.archived webhook event and dispatches a memorial post-mortem")
  .argument("[target]", "Target repository name to simulate archival event for", "unix-v6-legacy")
  .action(async (target) => {
    console.log(chalk.yellow(`\n⚡ [GitHub Webhook Ingestion] Simulating 'repository.archived' event for: ${chalk.bold(target)}...`));

    const mockPayload = JSON.stringify({
      action: "archived",
      repository: {
        name: target,
        full_name: `legacy-ancestors/${target}`,
        html_url: `https://github.com/legacy-ancestors/${target}`,
        description: "Historical repository archived by maintainer.",
        archived: true
      },
      sender: {
        login: "original-creator"
      }
    });

    const headers = {
      "x-github-event": "repository",
      "x-github-delivery": `delivery-mock-${Date.now()}`
    };

    const result = await processGitHubWebhook(mockPayload, headers);

    if (result.status === "processed") {
      console.log(chalk.green(`\n✅ [Webhook Dispatcher]: ${result.message}`));
      console.log(chalk.bold(`Dispatched To:  `) + chalk.cyan(result.dispatchedTo));
      if (result.artifactPath) {
        console.log(chalk.bold(`Artifact Path:  `) + chalk.yellow(result.artifactPath));
      }
      console.log(chalk.bold(`Risk Score:     `) + chalk.magenta(`${((result.memorialPayload?.mortality.abandonment_risk || 0) * 100).toFixed(1)}%`));
      console.log(chalk.hex("#FF7518")(`\n--- Generated GitHub Post-Mortem Preview ---\n`));
      console.log(result.memorialMarkdown?.slice(0, 750) + "\n...\n");
    } else {
      console.log(chalk.red(`Webhook simulation returned status: ${result.status} (${result.message})`));
    }
  });

// 7. Webhook Configuration Information
program
  .command("webhook-info")
  .description("Displays GitHub Webhook receiver configuration guide and setup URL")
  .action(() => {
    console.log(chalk.hex("#FF7518")(`
  ╔══════════════════════════════════════════════════════════════════════╗
  ║         🕯️  G I T H U B   W E B H O O K   R E C E I V E R  🕯️        ║
  ╚══════════════════════════════════════════════════════════════════════╝
`));
    console.log(chalk.bold("Payload URL:    ") + chalk.cyan("https://ofrenda.necrolink.tech/api/webhooks/github"));
    console.log(chalk.bold("Content Type:   ") + chalk.yellow("application/json"));
    console.log(chalk.bold("Secret:         ") + chalk.gray("Set as GITHUB_WEBHOOK_SECRET in environment"));
    console.log(chalk.bold("Events to Send: ") + chalk.white("Repositories (archived), Issues (labeled 'memorial')\n"));
    console.log(chalk.gray("When a repository is archived, NecroLink automatically triggers a durable resurrection,"));
    console.log(chalk.gray("generates a TabPFN mortality score, and dispatches an ofrenda memorial post-mortem.\n"));
  });

program.parse(process.argv);
