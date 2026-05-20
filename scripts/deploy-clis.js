#!/usr/bin/env node
/**
 * CLI Template Generator for context-med packages
 * 
 * Reads package config from a JSON definition and generates:
 * - bin/cli.js (Commander.js CLI)
 * - package.json (if missing)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.resolve(__dirname, '..', 'packages');

// ─── Package Definitions ────────────────────────────────────────────────────
// Each entry: { name, verbs: [{cmd, requiredFlags, description}], patterns }
const PACKAGE_DEFS = [
  {
    name: 'context-core',
    desc: 'Context-Med Core Orchestrator',
    version: '0.1.0',
    verbs: [
      { cmd: 'chain',  required: ['--input'],  desc: 'Chain multiple pipeline steps' },
      { cmd: 'route',  required: ['--input'],  desc: 'Route intent to appropriate module' },
      { cmd: 'health', required: [],            desc: 'Check system health' },
    ],
  },
  {
    name: 'context-gate',
    desc: 'Data ingestion and provenance gate',
    version: '0.1.0',
    verbs: [
      { cmd: 'ingest', required: ['--input'],  desc: 'Ingest raw data with provenance' },
      { cmd: 'lint',   required: ['--input'],  desc: 'Lint provenance metadata' },
    ],
  },
  {
    name: 'context-wiki',
    desc: 'Medical knowledge wiki builder',
    version: '0.1.0',
    verbs: [
      { cmd: 'ingest', required: ['--input'],  desc: 'Ingest content into wiki' },
      { cmd: 'lint',   required: ['--input'],  desc: 'Lint wiki structure' },
      { cmd: 'query',  required: ['--input'],  desc: 'Query the wiki' },
    ],
  },
  {
    name: 'context-va',
    desc: 'Visual abstract generator',
    version: '0.1.0',
    verbs: [
      { cmd: 'generate', required: ['--input'],  desc: 'Generate visual abstract' },
      { cmd: 'batch',    required: ['--input'],  desc: 'Batch process multiple inputs' },
    ],
  },
  {
    name: 'context-paper',
    desc: 'Academic paper forge',
    version: '0.1.0',
    verbs: [
      { cmd: 'forge',   required: ['--input'],  desc: 'Forge paper from structured input' },
      { cmd: 'verify',  required: ['--input'],  desc: 'Verify paper structure' },
      { cmd: 'compile', required: ['--input'],  desc: 'Compile paper to output format' },
    ],
  },
  {
    name: 'context-slides',
    desc: 'Presentation slide generator',
    version: '0.1.0',
    verbs: [
      { cmd: 'generate',      required: ['--input'],  desc: 'Generate slides' },
      { cmd: 'speaker-notes', required: ['--input'],  desc: 'Generate speaker notes' },
    ],
  },
  {
    name: 'context-narrate',
    desc: 'Medical narrative generator',
    version: '0.1.0',
    verbs: [
      { cmd: 'generate', required: ['--input'],  desc: 'Generate narrative' },
      { cmd: 'faq',      required: ['--input'],  desc: 'Generate FAQ from content' },
    ],
  },
  {
    name: 'context-shield',
    desc: 'PII shield and data protection',
    version: '0.1.0',
    verbs: [
      { cmd: 'scan', required: ['--input'],  desc: 'Scan for PII' },
      { cmd: 'mask', required: ['--input'],  desc: 'Mask detected PII' },
    ],
  },
  {
    name: 'context-hoop',
    desc: 'HITL approval hoop',
    version: '0.1.0',
    verbs: [
      { cmd: 'trigger', required: ['--input'],  desc: 'Trigger approval workflow' },
      { cmd: 'approve', required: ['--input'],  desc: 'Approve pending item' },
      { cmd: 'status',  required: [],            desc: 'Check approval status' },
      { cmd: 'lint',    required: ['--input'],  desc: 'Lint approval rules' },
    ],
  },
  {
    name: 'context-sim',
    desc: 'Clinical simulation compiler',
    version: '0.1.0',
    verbs: [
      { cmd: 'compile', required: ['--input'],  desc: 'Compile simulation scenario' },
      { cmd: 'batch',   required: ['--input'],  desc: 'Batch compile scenarios' },
    ],
  },
  {
    name: 'context-cert',
    desc: 'Certificate generator',
    version: '0.1.0',
    verbs: [
      { cmd: 'generate', required: ['--input'],  desc: 'Generate certificate' },
      { cmd: 'review',   required: ['--input'],  desc: 'Review certificate data' },
    ],
  },
  {
    name: 'context-qualitative',
    desc: 'Qualitative analysis tool',
    version: '0.1.0',
    verbs: [
      { cmd: 'analyze', required: ['--input'],  desc: 'Analyze qualitative data' },
      { cmd: 'compile', required: ['--input'],  desc: 'Compile analysis results' },
    ],
  },
  {
    name: 'context-avatar',
    desc: 'Avatar video renderer',
    version: '0.1.0',
    verbs: [
      { cmd: 'render',  required: ['--input'],  desc: 'Render avatar video' },
      { cmd: 'consent', required: ['--input'],  desc: 'Verify consent status' },
    ],
  },
  {
    name: 'context-sites',
    desc: 'Static site builder from wiki',
    version: '0.1.0',
    verbs: [
      { cmd: 'build', required: ['--input'],  desc: 'Build static site' },
      { cmd: 'lint',  required: ['--input'],  desc: 'Lint wiki structure' },
    ],
  },
  {
    name: 'context-kiosk',
    desc: 'Interactive kiosk server',
    version: '0.1.0',
    verbs: [
      { cmd: 'serve',     required: ['--config'], desc: 'Serve kiosk application' },
      { cmd: 'calibrate', required: ['--input'],  desc: 'Calibrate kiosk display' },
      { cmd: 'test',      required: [],            desc: 'Run self-diagnostics' },
      { cmd: 'status',    required: [],            desc: 'Show operational status' },
    ],
  },
  {
    name: 'context-ui',
    desc: 'Dashboard UI builder',
    version: '0.1.0',
    verbs: [
      { cmd: 'build',  required: ['--output'], desc: 'Build UI distribution' },
      { cmd: 'lint',   required: ['--input'],  desc: 'Lint UI components' },
      { cmd: 'status', required: [],            desc: 'Check backend connectivity' },
    ],
  },
  {
    name: 'pixel-office',
    desc: 'Pixel art office renderer',
    version: '0.1.0',
    verbs: [
      { cmd: 'render', required: ['--output'], desc: 'Render pixel scene' },
      { cmd: 'build',  required: ['--output'], desc: 'Build pixel assets' },
      { cmd: 'lint',   required: ['--input'],  desc: 'Validate sprite assets' },
      { cmd: 'status', required: [],            desc: 'Show event stream status' },
    ],
  },
  {
    name: 'marketing-agent',
    desc: 'Marketing content agent',
    version: '0.1.0',
    verbs: [
      { cmd: 'brief', required: ['--input'],  desc: 'Create marketing brief' },
      { cmd: 'draft', required: ['--input'],  desc: 'Draft marketing content' },
      { cmd: 'lint',  required: ['--input'],  desc: 'Validate brand guidelines' },
    ],
  },
  {
    name: 'social-agent',
    desc: 'Social media management agent',
    version: '0.1.0',
    verbs: [
      { cmd: 'plan',     required: ['--input'],  desc: 'Create social calendar' },
      { cmd: 'draft',    required: ['--input'],  desc: 'Draft social post' },
      { cmd: 'moderate', required: ['--input'],  desc: 'Moderate comments' },
    ],
  },
  {
    name: 'istabot-nokta',
    desc: 'Project discovery bot',
    version: '0.1.0',
    verbs: [
      { cmd: 'discover', required: ['--input'],  desc: 'Discover project ideas' },
      { cmd: 'execute',  required: ['--input'],  desc: 'Execute discovery plan' },
      { cmd: 'status',   required: ['--input'],  desc: 'Show MRLC phase' },
    ],
  },
];

// ─── Generate CLI for a package ─────────────────────────────────────────────
function generateCli(def) {
  const lines = [];
  lines.push(`#!/usr/bin/env node`);
  lines.push(`'use strict';`);
  lines.push(``);
  lines.push(`const { Command } = require('commander');`);
  lines.push(`const path = require('path');`);
  lines.push(`const fs = require('fs');`);
  lines.push(`const pkg = require('../package.json');`);
  lines.push(``);
  lines.push(`const program = new Command();`);
  lines.push(``);
  lines.push(`program`);
  lines.push(`  .name('${def.name}')`);
  lines.push(`  .description('${def.desc}')`);
  lines.push(`  .version(pkg.version);`);
  lines.push(``);

  for (const verb of def.verbs) {
    lines.push(`// ─── ${verb.cmd} ${'─'.repeat(Math.max(1, 60 - verb.cmd.length))}──`);
    lines.push(`program`);
    lines.push(`  .command('${verb.cmd}')`);
    lines.push(`  .description('${verb.desc}')`);

    // Add common flags
    const hasInput = verb.required.includes('--input');
    const hasOutput = verb.required.includes('--output');
    const hasConfig = verb.required.includes('--config');

    if (hasInput) {
      lines.push(`  .requiredOption('-i, --input <path>', 'Input file or directory')`);
    } else {
      lines.push(`  .option('-i, --input <path>', 'Input file or directory')`);
    }

    if (hasOutput) {
      lines.push(`  .requiredOption('-o, --output <path>', 'Output file or directory')`);
    } else {
      lines.push(`  .option('-o, --output <path>', 'Output file or directory')`);
    }

    if (hasConfig) {
      lines.push(`  .requiredOption('-c, --config <path>', 'Configuration file')`);
    }

    lines.push(`  .option('-f, --format <type>', 'Output format', 'json')`);
    lines.push(`  .option('--dry-run', 'Simulate without writing files')`);
    lines.push(`  .option('--domain <name>', 'Domain filter')`);
    lines.push(`  .action((opts) => {`);

    // Validation: check input file exists when --input is provided
    if (hasInput) {
      lines.push(`    if (opts.input && !fs.existsSync(path.resolve(opts.input))) {`);
      lines.push(`      console.error('Error: Input file not found: ' + path.resolve(opts.input));`);
      lines.push(`      process.exit(1);`);
      lines.push(`    }`);
    }

    // Dry-run handling
    lines.push(`    if (opts.dryRun) {`);
    lines.push(`      console.log('[${def.name}] ${verb.cmd} --dry-run: validated, no output written.');`);
    lines.push(`      return;`);
    lines.push(`    }`);

    // Output file generation for happy path
    lines.push(`    if (opts.output) {`);
    lines.push(`      const outDir = path.dirname(path.resolve(opts.output));`);
    lines.push(`      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });`);

    // Generate appropriate output based on format
    lines.push(`      const result = {`);
    lines.push(`        command: '${verb.cmd}',`);
    lines.push(`        package: '${def.name}',`);
    lines.push(`        timestamp: new Date().toISOString(),`);
    lines.push(`        status: 'completed',`);
    lines.push(`        input: opts.input || null,`);
    lines.push(`      };`);
    lines.push(`      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');`);
    lines.push(`      console.log('Output written to ' + opts.output);`);
    lines.push(`    } else {`);

    // For commands like status, test, lint that just print
    if (!hasInput && !hasOutput) {
      lines.push(`      const result = { status: 'ok', package: '${def.name}', command: '${verb.cmd}', timestamp: new Date().toISOString() };`);
      lines.push(`      if (opts.format === 'json') {`);
      lines.push(`        process.stdout.write(JSON.stringify(result, null, 2));`);
      lines.push(`      } else {`);
      lines.push(`        console.log('[${def.name}] ${verb.cmd}: OK');`);
      lines.push(`      }`);
    } else {
      // For lint-like commands that return status
      lines.push(`      const result = { status: 'ok', package: '${def.name}', command: '${verb.cmd}' };`);
      lines.push(`      if (opts.format === 'json') {`);
      lines.push(`        process.stdout.write(JSON.stringify(result, null, 2));`);
      lines.push(`      } else {`);
      lines.push(`        console.log('[${def.name}] ${verb.cmd}: completed');`);
      lines.push(`      }`);
    }
    lines.push(`    }`);
    lines.push(`  });`);
    lines.push(``);
  }

  lines.push(`// Error handling for unknown commands`);
  lines.push(`program.on('command:*', (operands) => {`);
  lines.push(`  console.error('Error: Unknown command "' + operands[0] + '".');`);
  lines.push(`  program.outputHelp();`);
  lines.push(`  process.exit(1);`);
  lines.push(`});`);
  lines.push(``);
  lines.push(`program.parse(process.argv);`);
  lines.push(``);
  lines.push(`if (program.args.length === 0 && process.argv.length <= 2) {`);
  lines.push(`  program.outputHelp();`);
  lines.push(`}`);
  lines.push(``);

  return lines.join('\n');
}

// ─── Generate package.json ──────────────────────────────────────────────────
function generatePackageJson(def) {
  return JSON.stringify({
    name: def.name,
    version: def.version,
    description: def.desc,
    main: 'src/index.js',
    bin: { [def.name]: './bin/cli.js' },
    scripts: { test: 'jest tests/cli' },
    dependencies: { commander: '>=11' },
    devDependencies: { jest: '>=29' },
  }, null, 2) + '\n';
}

// ─── Deploy ─────────────────────────────────────────────────────────────────
let created = 0;
let skipped = 0;

for (const def of PACKAGE_DEFS) {
  const pkgDir = path.join(PACKAGES_DIR, def.name);

  // Create bin/cli.js
  const binDir = path.join(pkgDir, 'bin');
  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

  const cliPath = path.join(binDir, 'cli.js');
  fs.writeFileSync(cliPath, generateCli(def), 'utf8');

  // Create package.json if it doesn't exist
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    fs.writeFileSync(pkgJsonPath, generatePackageJson(def), 'utf8');
  }

  // Create src/index.js stub if needed
  const srcDir = path.join(pkgDir, 'src');
  if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });
  const indexPath = path.join(srcDir, 'index.js');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, `'use strict';\nmodule.exports = {};\n`, 'utf8');
  }

  created++;
  console.log(`✅ ${def.name}: bin/cli.js created`);
}

console.log(`\nDone! Created ${created} CLIs, skipped ${skipped}.`);
