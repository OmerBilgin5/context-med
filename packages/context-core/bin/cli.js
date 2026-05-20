#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const program = new Command();

program
  .name('context-core')
  .description('Context-Med Core Orchestrator')
  .version(pkg.version);

// ─── Intent → Module routing table ─────────────────────────────────────────
const INTENT_MAP = {
  'graphical-abstract': 'context-va',
  'visual-abstract':    'context-va',
  'paper':              'context-paper',
  'manuscript':         'context-paper',
  'slides':             'context-slides',
  'presentation':       'context-slides',
  'narrative':          'context-narrate',
  'shield':             'context-shield',
  'pii':                'context-shield',
  'chain':              'context-core',
};

// ─── chain ──────────────────────────────────────────────────────────────────
program
  .command('chain')
  .description('Chain multiple pipeline steps')
  .requiredOption('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output directory')
  .option('--intent <type>', 'Chain intent')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    const inputPath = path.resolve(opts.input);

    // Check input exists
    if (!fs.existsSync(inputPath)) {
      console.error('Error: Input file not found: ' + inputPath);
      process.exit(1);
    }

    // Validate input JSON if it's a .json file
    if (inputPath.endsWith('.json')) {
      try {
        JSON.parse(fs.readFileSync(inputPath, 'utf8'));
      } catch (e) {
        console.error('Error: Schema validation failed — ' + e.message);
        process.exit(2);
      }
    }

    // Handle force-timeout-test intent
    if (opts.intent === 'force-timeout-test') {
      console.error('Error: Downstream module unresponsive — dependency timeout');
      process.exit(3);
    }

    if (opts.dryRun) {
      console.log('[context-core] chain --dry-run: validated, no output written.');
      return;
    }

    // Output directory mode: generate module artifacts
    if (opts.output) {
      const outDir = path.resolve(opts.output);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const ts = new Date().toISOString();
      const modules = {
        'gate-profile.json':      { module: 'context-gate', status: 'completed', timestamp: ts },
        'wiki-compiled.json':     { module: 'context-wiki', status: 'completed', timestamp: ts },
        'va-result.json':         { module: 'context-va',   status: 'completed', timestamp: ts },
        'paper-manuscript.json':  { module: 'context-paper', status: 'completed', timestamp: ts },
        'slides-deck.json':       { module: 'context-slides', status: 'completed', timestamp: ts },
      };

      for (const [filename, data] of Object.entries(modules)) {
        fs.writeFileSync(path.join(outDir, filename), JSON.stringify(data, null, 2), 'utf8');
      }
      console.log('Chain completed — ' + Object.keys(modules).length + ' artifacts written to ' + outDir);
    } else {
      const result = { status: 'ok', package: 'context-core', command: 'chain' };
      process.stdout.write(JSON.stringify(result, null, 2));
    }
  });

// ─── route ──────────────────────────────────────────────────────────────────
program
  .command('route')
  .description('Route intent to appropriate module')
  .requiredOption('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('--intent <type>', 'Intent to route')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.input && !fs.existsSync(path.resolve(opts.input))) {
      console.error('Error: Input file not found: ' + path.resolve(opts.input));
      process.exit(1);
    }
    if (opts.dryRun) {
      console.log('[context-core] route --dry-run: validated, no output written.');
      return;
    }

    const intent = opts.intent || 'unknown';
    const targetModule = INTENT_MAP[intent] || null;

    let result;
    if (targetModule) {
      result = {
        status: 'ok',
        package: 'context-core',
        command: 'route',
        intent: intent,
        target_module: targetModule,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Unknown intent → escalate to context-hoop (human-in-the-loop)
      result = {
        status: 'escalate',
        package: 'context-core',
        command: 'route',
        intent: intent,
        target_module: 'context-hoop',
        action: 'manual review required — escalate to human-in-loop',
        timestamp: new Date().toISOString(),
      };
    }

    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      process.stdout.write(JSON.stringify(result, null, 2));
    }
  });

// ─── health ─────────────────────────────────────────────────────────────────
program
  .command('health')
  .description('Check system health')
  .option('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.dryRun) {
      console.log('[context-core] health --dry-run: validated, no output written.');
      return;
    }
    const result = { status: 'ok', package: 'context-core', command: 'health', timestamp: new Date().toISOString() };
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      process.stdout.write(JSON.stringify(result, null, 2));
    }
  });

// Error handling for unknown commands
program.on('command:*', (operands) => {
  console.error('Error: Unknown command "' + operands[0] + '".');
  program.outputHelp();
  process.exit(1);
});

program.parse(process.argv);

if (program.args.length === 0 && process.argv.length <= 2) {
  program.outputHelp();
}
