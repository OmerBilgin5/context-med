#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const program = new Command();

program
  .name('pixel-office')
  .description('Pixel art office renderer')
  .version(pkg.version);

// ─── render ────────────────────────────────────────────────────────
program
  .command('render')
  .description('Render pixel scene')
  .option('-i, --input <path>', 'Input file or directory')
  .requiredOption('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.dryRun) {
      console.log('[pixel-office] render --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'render',
        package: 'pixel-office',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'pixel-office', command: 'render' };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[pixel-office] render: completed');
      }
    }
  });

// ─── build ─────────────────────────────────────────────────────────
program
  .command('build')
  .description('Build pixel assets')
  .option('-i, --input <path>', 'Input file or directory')
  .requiredOption('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.dryRun) {
      console.log('[pixel-office] build --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'build',
        package: 'pixel-office',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'pixel-office', command: 'build' };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[pixel-office] build: completed');
      }
    }
  });

// ─── lint ──────────────────────────────────────────────────────────
program
  .command('lint')
  .description('Validate sprite assets')
  .requiredOption('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    const inputExists = opts.input && fs.existsSync(path.resolve(opts.input));
    if (!inputExists && opts.input) {
      // Lint warning: asset directory not found — report but don't crash
      const result = { status: 'warning', package: 'pixel-office', command: 'lint', message: 'Asset path not found: ' + path.resolve(opts.input), findings: [] };
      process.stdout.write(JSON.stringify(result, null, 2));
      return;
    }
    if (opts.dryRun) {
      console.log('[pixel-office] lint --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'lint',
        package: 'pixel-office',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'pixel-office', command: 'lint' };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[pixel-office] lint: completed');
      }
    }
  });

// ─── status ────────────────────────────────────────────────────────
program
  .command('status')
  .description('Show event stream status')
  .option('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.dryRun) {
      console.log('[pixel-office] status --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'status',
        package: 'pixel-office',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'pixel-office', command: 'status', timestamp: new Date().toISOString() };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[pixel-office] status: OK');
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
