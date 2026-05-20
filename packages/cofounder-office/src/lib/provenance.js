'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROVENANCE_DIR = path.resolve(__dirname, '../../brains/cofounder-office/provenance');
const DECISIONS_DIR = path.resolve(__dirname, '../../brains/cofounder-office/decisions');

// Ensure directories exist
[PROVENANCE_DIR, DECISIONS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Auto-increment counter for session IDs
let _sessionCounter = 0;

/**
 * Generate a unique decision ID.
 */
function generateId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  _sessionCounter++;
  return `dec-${date}-${String(_sessionCounter).padStart(3, '0')}`;
}

/**
 * Create a short hash of input text for traceability.
 */
function hashInput(text) {
  return 'sha256:' + crypto.createHash('sha256').update(text || '').digest('hex').slice(0, 12);
}

/**
 * Record a provenance entry for an AI response.
 * 
 * @param {object} opts
 * @param {string} opts.persona - 'mimar', 'arabulucu', 'icraci'
 * @param {string} opts.channel - '#strateji', '#operasyon', '#genel'
 * @param {string} opts.user_input - Original user message
 * @param {string} opts.ai_output - AI response text (truncated for storage)
 * @param {string[]} opts.brain_reads - Files read during persona loading
 * @param {string} opts.hitl_status - 'auto', 'approved', 'rejected', 'pending'
 * @param {object} [opts.eval_score] - Eval middleware score result
 * @param {string[]} [opts.provenance_tags] - Tags from tagProvenance()
 * @returns {object} The recorded provenance entry
 */
function recordProvenance(opts) {
  const id = generateId();
  const now = new Date();

  const entry = {
    id,
    timestamp: now.toISOString(),
    persona: opts.persona,
    channel: opts.channel || '#genel',
    input_hash: hashInput(opts.user_input),
    input_preview: (opts.user_input || '').substring(0, 150),
    output_preview: (opts.ai_output || '').substring(0, 300),
    brain_reads: opts.brain_reads || getBrainReads(opts.persona),
    hitl_status: opts.hitl_status || 'auto',
    eval_score: opts.eval_score || null,
    provenance_tags: opts.provenance_tags || [],
    output_length: (opts.ai_output || '').length,
  };

  // ── Write to JSONL log (append) ──────────────────────────────────────
  const logFile = path.join(PROVENANCE_DIR, 'trail.jsonl');
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', 'utf8');

  // ── Write structured decision file ───────────────────────────────────
  const decisionFile = path.join(PROVENANCE_DIR, `${id}.json`);
  fs.writeFileSync(decisionFile, JSON.stringify(entry, null, 2), 'utf8');

  return entry;
}

/**
 * Get the list of brain files that were read for a given persona.
 * This is a static mapping based on the persona loading logic in server.js.
 */
function getBrainReads(persona) {
  const ROLE_TO_DIR = { mimar: 'cvo', arabulucu: 'pm', icraci: 'doer' };
  const dir = ROLE_TO_DIR[persona] || persona;
  const personaBase = path.resolve(__dirname, '../../brains/personas', dir);

  const reads = [];
  const files = ['persona.md', 'work.md', 'correction-log.md', 'correction-log.jsonl'];
  const tracks = ['works', 'conversations', 'expression', 'decisions', 'external', 'timeline'];

  files.forEach(f => {
    const fp = path.join(personaBase, f);
    if (fs.existsSync(fp)) reads.push(`personas/${dir}/${f}`);
  });

  tracks.forEach(t => {
    const tp = path.join(personaBase, 'tracks', t);
    if (fs.existsSync(tp)) {
      try {
        const entries = fs.readdirSync(tp);
        entries.forEach(e => reads.push(`personas/${dir}/tracks/${t}/${e}`));
      } catch { /* skip */ }
    }
  });

  return reads;
}

/**
 * Read all provenance entries from the JSONL log.
 * @param {object} [filters]
 * @param {number} [filters.last] - Return last N entries
 * @param {string} [filters.persona] - Filter by persona
 * @param {string} [filters.channel] - Filter by channel
 * @returns {Array} provenance entries
 */
function getTrail(filters = {}) {
  const logFile = path.join(PROVENANCE_DIR, 'trail.jsonl');

  if (!fs.existsSync(logFile)) return [];

  let entries = fs.readFileSync(logFile, 'utf8')
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => {
      try { return JSON.parse(line); }
      catch { return null; }
    })
    .filter(Boolean);

  // Apply filters
  if (filters.persona) {
    entries = entries.filter(e => e.persona === filters.persona);
  }
  if (filters.channel) {
    entries = entries.filter(e => e.channel === filters.channel);
  }

  // Last N
  if (filters.last && filters.last > 0) {
    entries = entries.slice(-filters.last);
  }

  return entries;
}

/**
 * Get provenance stats summary.
 */
function getStats() {
  const entries = getTrail();
  if (entries.length === 0) {
    return { total: 0, by_persona: {}, by_channel: {}, avg_output_length: 0 };
  }

  const byPersona = {};
  const byChannel = {};
  let totalLen = 0;
  let hitlApproved = 0;
  let hitlRejected = 0;

  entries.forEach(e => {
    byPersona[e.persona] = (byPersona[e.persona] || 0) + 1;
    byChannel[e.channel] = (byChannel[e.channel] || 0) + 1;
    totalLen += e.output_length || 0;
    if (e.hitl_status === 'approved') hitlApproved++;
    if (e.hitl_status === 'rejected') hitlRejected++;
  });

  return {
    total: entries.length,
    by_persona: byPersona,
    by_channel: byChannel,
    avg_output_length: Math.round(totalLen / entries.length),
    hitl: { approved: hitlApproved, rejected: hitlRejected, auto: entries.length - hitlApproved - hitlRejected },
    first_entry: entries[0]?.timestamp,
    last_entry: entries[entries.length - 1]?.timestamp,
  };
}

/**
 * Get a single provenance entry by ID.
 */
function getById(id) {
  const filePath = path.join(PROVENANCE_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch { return null; }
}

module.exports = {
  recordProvenance,
  getTrail,
  getStats,
  getById,
  getBrainReads,
  PROVENANCE_DIR,
};
