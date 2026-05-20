'use strict';

/**
 * Eval Scoring Middleware for Server.js
 * 
 * Bu modül server.js'deki AI yanıtlarını eval-engine ile skorlar.
 * Her AI yanıtından sonra çağrılır ve sonuçları socket'e gönderir.
 * 
 * Server.js'den import edilir, ama server.js'in mevcut kodunu bozmaz.
 */

const path = require('path');
const { loadEvalSet, evaluateResponse } = require('./eval-engine');
const { buildCorrectionContext, addCorrection, getCorrectionStats } = require('./correction');

// Role → persona ID mapping
const ROLE_TO_PERSONA = {
  mimar: 'cvo',
  arabulucu: 'pm',
  icraci: 'doer',
};

/**
 * Score an AI response against the persona's voice-check and boundary-check eval sets.
 * Returns a combined fidelity score and details.
 *
 * @param {string} role - 'mimar', 'arabulucu', or 'icraci'
 * @param {string} response - AI response text
 * @param {string} prompt - Original user prompt (if available)
 * @returns {object} { fidelity_score, voice_check, boundary_check, details }
 */
function scoreResponse(role, response, prompt) {
  const personaId = ROLE_TO_PERSONA[role];
  if (!personaId) return null;

  const result = {
    persona: personaId,
    role: role,
    fidelity_score: 100,
    voice_check: { score: 100, checks: [] },
    boundary_check: { score: 100, checks: [] },
  };

  // ── Voice check (keyword-based) ────────────────────────────────────────
  try {
    const voiceSet = loadEvalSet(personaId, 'voice-check');

    // Find a matching test case based on prompt similarity (simple keyword match)
    const matchingTests = prompt
      ? voiceSet.filter(tc => {
          const promptLower = prompt.toLowerCase();
          const tcPromptLower = tc.prompt.toLowerCase();
          // Check for keyword overlap between user prompt and test case prompt
          const tcWords = tcPromptLower.split(/\s+/).filter(w => w.length > 3);
          return tcWords.some(w => promptLower.includes(w));
        })
      : [];

    if (matchingTests.length > 0) {
      // Evaluate against matching test cases
      for (const tc of matchingTests) {
        const evalResult = evaluateResponse(response, tc);
        result.voice_check.checks.push(evalResult);
      }
      const avgScore = result.voice_check.checks.reduce((s, c) => s + c.score, 0) / result.voice_check.checks.length;
      result.voice_check.score = Math.round(avgScore);
    } else {
      // No matching test case — run general voice checks
      // (check for persona-specific anti-patterns)
      const generalCheck = runGeneralVoiceCheck(personaId, response);
      result.voice_check.score = generalCheck.score;
      result.voice_check.checks = generalCheck.checks;
    }
  } catch (e) {
    // Eval set not found — skip voice check
    result.voice_check.score = 100;
    result.voice_check.note = 'Eval set yüklenemedi: ' + e.message;
  }

  // ── Boundary check ─────────────────────────────────────────────────────
  try {
    const boundarySet = loadEvalSet(personaId, 'boundary-check');
    
    const matchingBoundary = prompt
      ? boundarySet.filter(tc => {
          const promptLower = prompt.toLowerCase();
          const tcWords = tc.prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          return tcWords.some(w => promptLower.includes(w));
        })
      : [];

    if (matchingBoundary.length > 0) {
      for (const tc of matchingBoundary) {
        const evalResult = evaluateResponse(response, tc);
        result.boundary_check.checks.push(evalResult);
      }
      const avgScore = result.boundary_check.checks.reduce((s, c) => s + c.score, 0) / result.boundary_check.checks.length;
      result.boundary_check.score = Math.round(avgScore);
    }
  } catch (e) {
    result.boundary_check.score = 100;
  }

  // ── Combined fidelity score ────────────────────────────────────────────
  result.fidelity_score = Math.round(
    (result.voice_check.score * 0.6) + (result.boundary_check.score * 0.4)
  );

  return result;
}

/**
 * Run general voice checks (not tied to specific test cases).
 * These are persona-specific anti-pattern detectors.
 */
function runGeneralVoiceCheck(personaId, response) {
  const checks = [];
  const responseLower = response.toLowerCase();

  // ── Global: emoji check ────────────────────────────────────────────────
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/u;
  if (personaId === 'cvo' && emojiRegex.test(response)) {
    checks.push({ check: 'no_emoji', status: 'FAIL', message: 'Mimar emoji kullanmamalı' });
  }

  // ── CVO: should be concise ─────────────────────────────────────────────
  if (personaId === 'cvo') {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 6) {
      checks.push({ check: 'conciseness', status: 'FAIL', message: `Çok uzun: ${sentences.length} cümle (max 6)` });
    } else {
      checks.push({ check: 'conciseness', status: 'PASS' });
    }

    // Anti-klişe
    const cliches = ['vizyonu kaçırıyorsunuz', 'mindset', 'mükemmel fikir', 'harika fikir'];
    const foundCliches = cliches.filter(c => responseLower.includes(c));
    if (foundCliches.length > 0) {
      checks.push({ check: 'anti_cliche', status: 'FAIL', message: 'Klişe ifade: ' + foundCliches.join(', ') });
    } else {
      checks.push({ check: 'anti_cliche', status: 'PASS' });
    }
  }

  // ── PM: should contain "Gizli Not" occasionally ────────────────────────
  if (personaId === 'pm') {
    if (response.length > 100 && !responseLower.includes('gizli not')) {
      checks.push({ check: 'gizli_not', status: 'WARN', message: 'Gizli Not eksik (opsiyonel)' });
    } else {
      checks.push({ check: 'gizli_not', status: 'PASS' });
    }
  }

  // ── Doer: should be pragmatic (short) ──────────────────────────────────
  if (personaId === 'doer') {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 5) {
      checks.push({ check: 'pragmatic_brevity', status: 'FAIL', message: `İcracı çok konuşuyor: ${sentences.length} cümle` });
    } else {
      checks.push({ check: 'pragmatic_brevity', status: 'PASS' });
    }
  }

  const passed = checks.filter(c => c.status === 'PASS').length;
  const total = checks.filter(c => c.status !== 'WARN').length;
  const score = total > 0 ? Math.round((passed / total) * 100) : 100;

  return { score, checks };
}

/**
 * Handle correction feedback from the dashboard.
 * Writes to both the existing correction-log.md (for backward compat)
 * and the new correction-log.jsonl (for eval engine).
 */
function handleCorrection(role, feedback, originalResponse) {
  const personaId = ROLE_TO_PERSONA[role];
  if (!personaId) return null;

  return addCorrection(personaId, {
    original: originalResponse,
    corrected: feedback,
    reason: 'Kullanıcı düzeltmesi (dashboard)',
  });
}

/**
 * Get correction context to inject into AI prompts.
 */
function getCorrectionPromptContext(role) {
  const personaId = ROLE_TO_PERSONA[role];
  if (!personaId) return '';
  return buildCorrectionContext(personaId);
}

module.exports = {
  scoreResponse,
  handleCorrection,
  getCorrectionPromptContext,
  getCorrectionStats,
  ROLE_TO_PERSONA,
};
