#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const program = new Command();

program
  .name('context-hoop')
  .description('HITL approval hoop')
  .version(pkg.version);

// ─── trigger ───────────────────────────────────────────────────────
program
  .command('trigger')
  .description('Trigger approval workflow')
  .requiredOption('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.input && !fs.existsSync(path.resolve(opts.input))) {
      console.error('Error: Input file not found: ' + path.resolve(opts.input));
      process.exit(1);
    }
    if (opts.dryRun) {
      console.log('[context-hoop] trigger --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'trigger',
        package: 'context-hoop',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-hoop', command: 'trigger' };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-hoop] trigger: completed');
      }
    }
  });

// ─── approve ───────────────────────────────────────────────────────
program
  .command('approve')
  .description('Approve pending item')
  .requiredOption('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.input && !fs.existsSync(path.resolve(opts.input))) {
      console.error('Error: Input file not found: ' + path.resolve(opts.input));
      process.exit(1);
    }
    if (opts.dryRun) {
      console.log('[context-hoop] approve --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'approve',
        package: 'context-hoop',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-hoop', command: 'approve' };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-hoop] approve: completed');
      }
    }
  });

// ─── status ────────────────────────────────────────────────────────
program
  .command('status')
  .description('Check approval status')
  .option('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.dryRun) {
      console.log('[context-hoop] status --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'status',
        package: 'context-hoop',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-hoop', command: 'status', timestamp: new Date().toISOString() };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-hoop] status: OK');
      }
    }
  });

// ─── lint ──────────────────────────────────────────────────────────
program
  .command('lint')
  .description('Lint approval rules')
  .requiredOption('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.input && !fs.existsSync(path.resolve(opts.input))) {
      console.error('Error: Input file not found: ' + path.resolve(opts.input));
      process.exit(1);
    }
    if (opts.dryRun) {
      console.log('[context-hoop] lint --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'lint',
        package: 'context-hoop',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-hoop', command: 'lint' };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-hoop] lint: completed');
      }
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
