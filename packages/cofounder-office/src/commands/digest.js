'use strict';

const fs = require('fs');
const path = require('path');
const { buildRoster } = require('./roster');

/**
 * Convert an object to a simple YAML string (no dependency needed).
 */
function toYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  let out = '';
  if (Array.isArray(obj)) {
    obj.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        out += `${pad}-\n`;
        Object.entries(item).forEach(([k, v]) => {
          out += `${pad}  ${k}: ${JSON.stringify(v)}\n`;
        });
      } else {
        out += `${pad}- ${JSON.stringify(item)}\n`;
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([k, v]) => {
      if (typeof v === 'object') {
        out += `${pad}${k}:\n${toYaml(v, indent + 1)}`;
      } else {
        out += `${pad}${k}: ${JSON.stringify(v)}\n`;
      }
    });
  }
  return out;
}

/**
 * Main digest command handler.
 */
module.exports = function digest(opts) {
  const roster = buildRoster();
  const activeCount = roster.filter(p => p.status === 'active').length;

  if (opts.dryRun) {
    console.log(`Active Personas: ${activeCount}`);
    console.log('Dry run complete — no files written.');
    return;
  }

  const result = {
    timestamp: new Date().toISOString(),
    office: 'cofounder-office',
    personas: roster,
    summary: {
      total: roster.length,
      active: activeCount,
      inactive: roster.length - activeCount,
    },
  };

  // Ensure output directory exists
  const outDir = path.dirname(path.resolve(opts.output));
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  if (opts.format === 'yaml') {
    fs.writeFileSync(opts.output, toYaml(result), 'utf8');
  } else {
    fs.writeFileSync(opts.output, JSON.stringify(result, null, 2), 'utf8');
  }

  console.log(`Digest written to ${opts.output}`);
};
