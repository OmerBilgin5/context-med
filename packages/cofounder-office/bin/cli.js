#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const program = new Command();

program
  .name('cofounder-office')
  .description('Cofounder Office CLI — AI persona roster, digest, consult, fire, eval')
  .version(pkg.version);

// ─── Helper: validate file exists ───────────────────────────────────────────
function requireFileExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    const abs = path.resolve(filePath);
    console.error(`Error: ${label} file not found: ${abs}`);
    process.exit(1);
  }
}

// ─── roster ─────────────────────────────────────────────────────────────────
program
  .command('roster')
  .description('List all office personas and their roles')
  .option('-f, --format <type>', 'Output format: json | markdown', 'json')
  .action((opts) => {
    const validFormats = ['json', 'markdown'];
    if (!validFormats.includes(opts.format)) {
      console.error(`Error: Invalid format "${opts.format}". Valid options: json, markdown`);
      process.exit(1);
    }
    const roster = require('../src/commands/roster');
    roster(opts);
  });

// ─── digest ─────────────────────────────────────────────────────────────────
program
  .command('digest')
  .description('Generate office summary digest')
  .requiredOption('-o, --output <path>', 'Output file path')
  .option('-f, --format <type>', 'Output format: json | yaml', 'json')
  .option('-c, --config <path>', 'Configuration file path')
  .option('--dry-run', 'Simulate without writing files')
  .action((opts) => {
    const digest = require('../src/commands/digest');
    digest(opts);
  });

// ─── consult ────────────────────────────────────────────────────────────────
program
  .command('consult')
  .description('Consult with office personas on a topic')
  .requiredOption('-i, --input <path>', 'Input file to consult about')
  .option('-p, --persona <id>', 'Specific persona to consult')
  .action((opts) => {
    const consult = require('../src/commands/consult');
    consult(opts);
  });

// ─── fire ───────────────────────────────────────────────────────────────────
program
  .command('fire')
  .description('Deactivate a persona from the office')
  .requiredOption('-i, --input <id>', 'Persona ID to fire')
  .action((opts) => {
    const fire = require('../src/commands/fire');
    fire(opts);
  });

// ─── eval ───────────────────────────────────────────────────────────────────
program
  .command('eval')
  .description('Evaluate output quality against a baseline')
  .requiredOption('-i, --input <path>', 'Input file to evaluate')
  .requiredOption('-b, --baseline <path>', 'Baseline file for comparison')
  .option('-o, --output <path>', 'Output file for evaluation results')
  .action((opts) => {
    const evalCmd = require('../src/commands/eval');
    evalCmd(opts);
  });

// ─── persona-eval ───────────────────────────────────────────────────────────
program
  .command('persona-eval')
  .description('Evaluate persona voice fidelity and boundary compliance')
  .requiredOption('-p, --persona <id>', 'Persona ID: cvo, pm, doer')
  .option('-e, --eval-set <type>', 'Eval set type: voice-check | boundary-check', 'voice-check')
  .option('-r, --responses <path>', 'Pre-recorded responses JSON file for offline eval')
  .option('-o, --output <path>', 'Output file for eval results')
  .option('--ratchet', 'Compare against saved baseline (fail on regression)')
  .action((opts) => {
    const personaEval = require('../src/commands/persona-eval');
    personaEval(opts);
  });

// ─── schema ─────────────────────────────────────────────────────────────────
program
  .command('schema')
  .description('Validate and display the office operational schema (office.yml)')
  .option('--validate', 'Validate office.yml without displaying full output')
  .option('-f, --format <type>', 'Output format: human | json', 'human')
  .option('-c, --config <path>', 'Custom office.yml path')
  .action((opts) => {
    const schemaCmd = require('../src/commands/schema');
    schemaCmd(opts);
  });

// ─── audit ──────────────────────────────────────────────────────────────────
program
  .command('audit')
  .description('View provenance trail — who decided what, when, and why')
  .option('-l, --last <n>', 'Show last N entries')
  .option('-p, --persona <id>', 'Filter by persona: mimar, arabulucu, icraci')
  .option('--id <id>', 'Show detailed info for a specific decision ID')
  .option('--stats', 'Show provenance statistics')
  .option('-f, --format <type>', 'Output format: human | json', 'human')
  .action((opts) => {
    const auditCmd = require('../src/commands/audit');
    auditCmd(opts);
  });

// ─── hitl ───────────────────────────────────────────────────────────────────
program
  .command('hitl')
  .description('Test HITL risk classification or view policy')
  .option('-t, --test <text>', 'Test risk classification on sample text')
  .option('-p, --persona <id>', 'Persona context for risk assessment', 'arabulucu')
  .option('-f, --format <type>', 'Output format: human | json', 'human')
  .action((opts) => {
    const hitlCmd = require('../src/commands/hitl');
    hitlCmd(opts);
  });

// ─── schedule ───────────────────────────────────────────────────────────────
program
  .command('schedule')
  .description('View and manage proactive schedules (standup, review, sweep)')
  .option('--trigger <name>', 'Simulate triggering a specific schedule')
  .option('--due', 'Show only schedules that are due to run')
  .option('-f, --format <type>', 'Output format: human | json', 'human')
  .action((opts) => {
    const scheduleCmd = require('../src/commands/schedule');
    scheduleCmd(opts);
  });

// ─── Error handling for unknown commands ────────────────────────────────────
program.on('command:*', (operands) => {
  console.error(`Error: Unknown command "${operands[0]}".`);
  program.outputHelp();
  process.exit(1);
});

// Parse and handle no-args
program.parse(process.argv);

// If no command was provided and no flags handled it
if (program.args.length === 0 && process.argv.length <= 2) {
  program.outputHelp();
}
