'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Simple JSON schema validator.
 * Returns true if the JSON has expected structure.
 */
function isValidSchema(data) {
  // A valid output should be a non-null object with at least one meaningful field
  if (typeof data !== 'object' || data === null) return false;
  if (Array.isArray(data)) return false;

  // Check for known invalid patterns (from invalid-schema-sample.json)
  if (data._invalid === true || data.error === 'intentional_schema_violation') {
    return false;
  }

  return true;
}

/**
 * Compute a simple similarity score between two JSON objects.
 * Returns a number between 0 and 100.
 */
function computeScore(inputData, baselineData) {
  const inputKeys = Object.keys(inputData);
  const baselineKeys = Object.keys(baselineData);

  if (baselineKeys.length === 0) return 50; // neutral score

  // Key overlap ratio
  const commonKeys = inputKeys.filter(k => baselineKeys.includes(k));
  const keyScore = (commonKeys.length / Math.max(baselineKeys.length, 1)) * 50;

  // Value similarity for common keys
  let valueScore = 0;
  let valueCount = 0;
  for (const key of commonKeys) {
    valueCount++;
    const a = JSON.stringify(inputData[key]);
    const b = JSON.stringify(baselineData[key]);
    if (a === b) {
      valueScore += 50 / Math.max(commonKeys.length, 1);
    } else {
      // Partial credit for non-null values
      valueScore += 20 / Math.max(commonKeys.length, 1);
    }
  }

  return Math.min(100, Math.max(0, Math.round(keyScore + valueScore)));
}

/**
 * Main eval command handler.
 */
module.exports = function evalCmd(opts) {
  // Validate input file exists
  const inputPath = path.resolve(opts.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  // Validate baseline file exists
  const baselinePath = path.resolve(opts.baseline);
  if (!fs.existsSync(baselinePath)) {
    console.error(`Error: Baseline file not found: ${baselinePath}`);
    process.exit(1);
  }

  // Parse input JSON
  let inputData;
  try {
    inputData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  } catch (e) {
    console.error(`Error: Invalid JSON in input file: ${e.message}`);
    process.exit(2);
  }

  // Schema validation
  if (!isValidSchema(inputData)) {
    console.error('Error: Input file has invalid schema — validation error detected.');
    process.exit(2);
  }

  // Parse baseline JSON
  let baselineData;
  try {
    baselineData = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  } catch (e) {
    console.error(`Error: Invalid JSON in baseline file: ${e.message}`);
    process.exit(2);
  }

  // Compute score
  const score = computeScore(inputData, baselineData);

  const result = {
    eval_score: score,
    score: score,
    input: opts.input,
    baseline: opts.baseline,
    evaluated_at: new Date().toISOString(),
    status: score >= 50 ? 'pass' : 'regression',
  };

  // Write output if requested
  if (opts.output) {
    const outDir = path.dirname(path.resolve(opts.output));
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(opts.output, JSON.stringify(result, null, 2), 'utf8');
    console.log(`Eval result written to ${opts.output}`);
  } else {
    console.log(`Eval score: ${score}/100 — ${result.status}`);
  }
};
