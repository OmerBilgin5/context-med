'use strict';

const fs = require('fs');
const path = require('path');

const PERSONA_DIR = path.resolve(__dirname, '../../brains/personas');

// Persona metadata (id → display info)
const PERSONA_META = {
  cvo:  { name: 'Mimar (The Architect)',   role: 'stratejist' },
  pm:   { name: 'Arabulucu (The Filter)',  role: 'arabulucu'  },
  doer: { name: 'İcracı (The Operative)',  role: 'icracı'     },
};

/**
 * Get the status of a persona from its status.json file.
 * Returns 'active' if no status.json exists.
 */
function getPersonaStatus(personaId) {
  const statusFile = path.join(PERSONA_DIR, personaId, 'status.json');
  try {
    if (fs.existsSync(statusFile)) {
      const data = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
      return data.status || 'active';
    }
  } catch { /* ignore parse errors */ }
  return 'active';
}

/**
 * Build the full roster array.
 */
function buildRoster() {
  return Object.entries(PERSONA_META).map(([id, meta]) => ({
    id,
    name: meta.name,
    role: meta.role,
    status: getPersonaStatus(id),
  }));
}

/**
 * Format roster as markdown.
 */
function formatMarkdown(roster) {
  let md = '# Cofounder Office — Roster\n\n';
  roster.forEach(p => {
    const badge = p.status === 'active' ? '🟢' : '🔴';
    md += `- **${p.name}** (${p.id}) — ${p.role} ${badge} ${p.status}\n`;
  });
  return md;
}

/**
 * Main roster command handler.
 */
module.exports = function roster(opts) {
  const list = buildRoster();

  if (opts.format === 'json') {
    process.stdout.write(JSON.stringify(list, null, 2));
  } else if (opts.format === 'markdown') {
    process.stdout.write(formatMarkdown(list));
  }
};

// Export helpers for other commands
module.exports.buildRoster = buildRoster;
module.exports.PERSONA_DIR = PERSONA_DIR;
module.exports.PERSONA_META = PERSONA_META;
module.exports.getPersonaStatus = getPersonaStatus;
