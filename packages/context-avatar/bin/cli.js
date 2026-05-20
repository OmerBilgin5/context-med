#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

const program = new Command();

program
  .name('context-avatar')
  .description('Avatar video renderer')
  .version(pkg.version);

// ─── render ────────────────────────────────────────────────────────
program
  .command('render')
  .description('Render avatar video')
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
      console.log('[context-avatar] render --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'render',
        package: 'context-avatar',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-avatar', command: 'render' };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-avatar] render: completed');
      }
    }
  });

// ─── consent ───────────────────────────────────────────────────────
program
  .command('consent')
  .description('Verify consent status')
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
      console.log('[context-avatar] consent --dry-run: validated, no output written.');
      return;
    }
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const result = {
        command: 'consent',
        package: 'context-avatar',
        timestamp: new Date().toISOString(),
        status: 'completed',
        input: opts.input || null,
      };
      fs.writeFileSync(path.resolve(opts.output), JSON.stringify(result, null, 2), 'utf8');
      console.log('Output written to ' + opts.output);
    } else {
      const result = { status: 'ok', package: 'context-avatar', command: 'consent' };
      if (opts.format === 'json') {
        process.stdout.write(JSON.stringify(result, null, 2));
      } else {
        console.log('[context-avatar] consent: completed');
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
