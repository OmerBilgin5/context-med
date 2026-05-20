'use strict';

const fs = require('fs');
const path = require('path');

const PERSONA_DIR = path.resolve(__dirname, '../../brains/personas');

/**
 * Append a correction entry to a persona's correction-log.jsonl.
 *
 * @param {string} personaId - 'cvo', 'pm', or 'doer'
 * @param {object} correction - { original, corrected, reason, message_id }
 */
function addCorrection(personaId, correction) {
  const logFile = path.join(PERSONA_DIR, personaId, 'correction-log.jsonl');

  const entry = {
    timestamp: new Date().toISOString(),
    persona: personaId,
    original: correction.original || '',
    corrected: correction.corrected || '',
    reason: correction.reason || '',
    message_id: correction.message_id || null,
  };

  // Append as JSONL (one JSON object per line)
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', 'utf8');

  return entry;
}

/**
 * Read all corrections for a persona.
 *
 * @param {string} personaId - 'cvo', 'pm', or 'doer'
 * @returns {Array} correction entries
 */
function getCorrections(personaId) {
  const logFile = path.join(PERSONA_DIR, personaId, 'correction-log.jsonl');

  if (!fs.existsSync(logFile)) return [];

  const lines = fs.readFileSync(logFile, 'utf8')
    .split('\n')
    .filter(line => line.trim().length > 0);

  return lines.map(line => {
    try { return JSON.parse(line); }
    catch { return null; }
  }).filter(Boolean);
}

/**
 * Build a correction context string to inject into AI prompts.
 * This tells the AI what the user has corrected in the past,
 * so the persona can evolve based on feedback.
 *
 * @param {string} personaId
 * @param {number} maxEntries - limit to last N corrections
 * @returns {string} formatted correction context
 */
function buildCorrectionContext(personaId, maxEntries = 10) {
  const corrections = getCorrections(personaId);

  if (corrections.length === 0) return '';

  const recent = corrections.slice(-maxEntries);

  let context = '\n\n--- DÜZELTMELERİM (Kullanıcı Geri Bildirimi) ---\n';
  context += 'Aşağıdaki düzeltmeler kullanıcı tarafından verilmiştir. Bu persona olarak yanıt verirken bu düzeltmeleri dikkate al:\n\n';

  recent.forEach((c, i) => {
    context += `${i + 1}. `;
    if (c.original) {
      context += `Yanlış: "${c.original.substring(0, 100)}"\n`;
    }
    if (c.corrected) {
      context += `   Doğru: "${c.corrected.substring(0, 100)}"\n`;
    }
    if (c.reason) {
      context += `   Neden: ${c.reason.substring(0, 100)}\n`;
    }
    context += '\n';
  });

  return context;
}

/**
 * Get correction stats for a persona.
 */
function getCorrectionStats(personaId) {
  const corrections = getCorrections(personaId);
  return {
    persona: personaId,
    total_corrections: corrections.length,
    last_correction: corrections.length > 0 ? corrections[corrections.length - 1].timestamp : null,
  };
}

module.exports = {
  addCorrection,
  getCorrections,
  buildCorrectionContext,
  getCorrectionStats,
};
