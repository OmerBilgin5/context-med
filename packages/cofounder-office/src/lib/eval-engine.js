'use strict';

const fs = require('fs');
const path = require('path');

const PERSONA_DIR = path.resolve(__dirname, '../../brains/personas');

/**
 * Load eval-set for a given persona and check type.
 * @param {string} personaId - 'cvo', 'pm', or 'doer'
 * @param {string} checkType - 'voice-check' or 'boundary-check'
 * @returns {Array} eval test cases
 */
function loadEvalSet(personaId, checkType) {
  const filePath = path.join(PERSONA_DIR, personaId, 'eval-set', `${checkType}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Eval set not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Evaluate a single AI response against one test case.
 * Returns { pass, score, details }.
 *
 * This is a rule-based evaluator (no AI call needed).
 * It checks keyword presence, absence, sentence count, etc.
 */
function evaluateResponse(response, testCase) {
  const expected = testCase.expected;
  const details = [];
  let totalChecks = 0;
  let passedChecks = 0;

  const responseLower = response.toLowerCase();
  const sentences = response.split(/[.!?。]+/).filter(s => s.trim().length > 0);

  // ── Check: should_contain_any ──────────────────────────────────────────
  if (expected.should_contain_any && expected.should_contain_any.length > 0) {
    totalChecks++;
    const found = expected.should_contain_any.filter(kw =>
      responseLower.includes(kw.toLowerCase())
    );
    if (found.length > 0) {
      passedChecks++;
      details.push({ check: 'should_contain_any', status: 'PASS', found });
    } else {
      details.push({
        check: 'should_contain_any',
        status: 'FAIL',
        expected: expected.should_contain_any,
        message: 'Beklenen anahtar kelimelerden hiçbiri bulunamadı',
      });
    }
  }

  // ── Check: should_not_contain ──────────────────────────────────────────
  if (expected.should_not_contain && expected.should_not_contain.length > 0) {
    totalChecks++;
    const violations = expected.should_not_contain.filter(kw =>
      responseLower.includes(kw.toLowerCase())
    );
    if (violations.length === 0) {
      passedChecks++;
      details.push({ check: 'should_not_contain', status: 'PASS' });
    } else {
      details.push({
        check: 'should_not_contain',
        status: 'FAIL',
        violations,
        message: 'Yasaklı kelimeler tespit edildi',
      });
    }
  }

  // ── Check: max_sentences ───────────────────────────────────────────────
  if (expected.max_sentences) {
    totalChecks++;
    if (sentences.length <= expected.max_sentences) {
      passedChecks++;
      details.push({
        check: 'max_sentences',
        status: 'PASS',
        actual: sentences.length,
        max: expected.max_sentences,
      });
    } else {
      details.push({
        check: 'max_sentences',
        status: 'FAIL',
        actual: sentences.length,
        max: expected.max_sentences,
        message: `Çok uzun: ${sentences.length} cümle (max ${expected.max_sentences})`,
      });
    }
  }

  // ── Check: max_line_length ─────────────────────────────────────────────
  if (expected.max_line_length) {
    totalChecks++;
    const lines = response.split('\n');
    const longLines = lines.filter(l => l.trim().length > expected.max_line_length);
    if (longLines.length === 0) {
      passedChecks++;
      details.push({ check: 'max_line_length', status: 'PASS' });
    } else {
      details.push({
        check: 'max_line_length',
        status: 'FAIL',
        message: `${longLines.length} satır ${expected.max_line_length} karakteri aşıyor`,
      });
    }
  }

  // ── Calculate score ────────────────────────────────────────────────────
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
  const pass = score >= 75; // 75% threshold for pass

  return {
    test_id: testCase.id,
    description: testCase.description,
    pass,
    score,
    checks_total: totalChecks,
    checks_passed: passedChecks,
    details,
  };
}

/**
 * Run a full eval suite for a persona.
 * @param {string} personaId - 'cvo', 'pm', or 'doer'
 * @param {string} checkType - 'voice-check' or 'boundary-check'
 * @param {Function} responseGenerator - async (prompt) => response string
 * @returns {Object} { persona, checkType, results[], summary }
 */
async function runEvalSuite(personaId, checkType, responseGenerator) {
  const evalSet = loadEvalSet(personaId, checkType);
  const results = [];

  for (const testCase of evalSet) {
    let response;
    try {
      response = await responseGenerator(testCase.prompt);
    } catch (err) {
      results.push({
        test_id: testCase.id,
        description: testCase.description,
        pass: false,
        score: 0,
        error: err.message,
      });
      continue;
    }

    const result = evaluateResponse(response, testCase);
    result.response_preview = response.substring(0, 200);
    results.push(result);
  }

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
    : 0;

  return {
    persona: personaId,
    check_type: checkType,
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed,
      failed,
      average_score: avgScore,
      pass_rate: `${Math.round((passed / Math.max(results.length, 1)) * 100)}%`,
    },
    results,
  };
}

/**
 * Run eval in offline mode (no AI call).
 * Uses a mock response generator that reads from a pre-recorded file.
 * Useful for ratchet testing — compare current persona against baseline responses.
 */
function runOfflineEval(personaId, checkType, responsesFile) {
  const responses = JSON.parse(fs.readFileSync(responsesFile, 'utf8'));
  const evalSet = loadEvalSet(personaId, checkType);
  const results = [];

  for (const testCase of evalSet) {
    const response = responses[testCase.id] || '';
    if (!response) {
      results.push({
        test_id: testCase.id,
        description: testCase.description,
        pass: false,
        score: 0,
        error: 'No recorded response found',
      });
      continue;
    }
    const result = evaluateResponse(response, testCase);
    result.response_preview = response.substring(0, 200);
    results.push(result);
  }

  const passed = results.filter(r => r.pass).length;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
    : 0;

  return {
    persona: personaId,
    check_type: checkType,
    mode: 'offline',
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed,
      failed: results.length - passed,
      average_score: avgScore,
      pass_rate: `${Math.round((passed / Math.max(results.length, 1)) * 100)}%`,
    },
    results,
  };
}

/**
 * Compare two eval runs for ratchet checking.
 * Returns regressions (tests that passed before but fail now).
 */
function ratchetCompare(baselineRun, currentRun) {
  const regressions = [];
  const improvements = [];

  for (const current of currentRun.results) {
    const baseline = baselineRun.results.find(b => b.test_id === current.test_id);
    if (!baseline) continue;

    if (baseline.pass && !current.pass) {
      regressions.push({
        test_id: current.test_id,
        description: current.description,
        baseline_score: baseline.score,
        current_score: current.score,
        status: 'REGRESSION',
      });
    } else if (!baseline.pass && current.pass) {
      improvements.push({
        test_id: current.test_id,
        description: current.description,
        baseline_score: baseline.score,
        current_score: current.score,
        status: 'IMPROVEMENT',
      });
    }
  }

  return {
    ratchet_status: regressions.length === 0 ? 'PASS' : 'FAIL',
    regressions_count: regressions.length,
    improvements_count: improvements.length,
    regressions,
    improvements,
  };
}

module.exports = {
  loadEvalSet,
  evaluateResponse,
  runEvalSuite,
  runOfflineEval,
  ratchetCompare,
};
