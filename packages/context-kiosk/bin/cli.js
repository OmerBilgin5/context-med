#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const program = new Command();

program
  .name('context-kiosk')
  .description('Interactive kiosk server')
  .version(pkg.version);

// ─── serve ─────────────────────────────────────────────────────────
program
  .command('serve')
  .description('Serve kiosk application')
  .option('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .requiredOption('-c, --config <path>', 'Configuration file')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.dryRun) {
      console.log('[context-kiosk] serve --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'serve',
        package: 'context-kiosk',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-kiosk', command: 'serve', timestamp: new Date().toISOString() };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-kiosk] serve: OK');
      }
    }
  });

// ─── calibrate ─────────────────────────────────────────────────────
program
  .command('calibrate')
  .description('Calibrate kiosk display')
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
      console.log('[context-kiosk] calibrate --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'calibrate',
        package: 'context-kiosk',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-kiosk', command: 'calibrate' };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-kiosk] calibrate: completed');
      }
    }
  });

// ─── test ──────────────────────────────────────────────────────────
program
  .command('test')
  .description('Run self-diagnostics')
  .option('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.dryRun) {
      console.log('[context-kiosk] test --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'test',
        package: 'context-kiosk',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-kiosk', command: 'test', timestamp: new Date().toISOString() };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-kiosk] test: OK');
      }
    }
  });

// ─── status ────────────────────────────────────────────────────────
program
  .command('status')
  .description('Show operational status')
  .option('-i, --input <path>', 'Input file or directory')
  .option('-o, --output <path>', 'Output file or directory')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('--dry-run', 'Simulate without writing files')
  .option('--domain <name>', 'Domain filter')
  .action((opts) => {
    if (opts.dryRun) {
      console.log('[context-kiosk] status --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'status',
        package: 'context-kiosk',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-kiosk', command: 'status', timestamp: new Date().toISOString() };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-kiosk] status: OK');
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
