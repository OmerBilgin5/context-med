'use strict';

const fs = require('fs');
const path = require('path');
const { loadEvalSet, evaluateResponse, runOfflineEval, ratchetCompare } = require('../lib/eval-engine');

const PERSONA_DIR = path.resolve(__dirname, '../../brains/personas');
const EVAL_RESULTS_DIR = path.resolve(__dirname, '../../brains/cofounder-office/eval-results');

/**
 * Main persona-eval command handler.
 * 
 * Modes:
 *  1. --responses <file>  → offline eval against pre-recorded responses
 *  2. --ratchet           → compare current run against last saved baseline
 *  3. (default)           → show eval-set structure and expected behavior
 */
module.exports = function personaEval(opts) {
  const personaId = opts.persona;
  const checkType = opts.evalSet || 'voice-check';

  // Validate persona
  const validPersonas = ['cvo', 'pm', 'doer'];
  if (!validPersonas.includes(personaId)) {
    console.error(`Error: Unknown persona "${personaId}". Valid: ${validPersonas.join(', ')}`);
    process.exit(1);
  }

  // Load eval set
  let evalSet;
  try {
    evalSet = loadEvalSet(personaId, checkType);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  // Ensure eval-results directory
  if (!fs.existsSync(EVAL_RESULTS_DIR)) {
    fs.mkdirSync(EVAL_RESULTS_DIR, { recursive: true });
  }

  // ── Mode: Offline eval with pre-recorded responses ────────────────────
  if (opts.responses) {
    const responsesPath = path.resolve(opts.responses);
    if (!fs.existsSync(responsesPath)) {
      console.error(`Error: Responses file not found: ${responsesPath}`);
      process.exit(1);
    }

    const result = runOfflineEval(personaId, checkType, responsesPath);

    // Save result as baseline for future ratchet checks
    const resultFile = path.join(EVAL_RESULTS_DIR, `${personaId}-${checkType}-latest.json`);
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2), 'utf8');

    // Write to output file if specified
    if (opts.output) {
      const outDir = path.dirname(path.resolve(opts.output));
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(opts.output, JSON.stringify(result, null, 2), 'utf8');
    }

    // Print summary
    printSummary(result);

    // ── Ratchet check ─────────────────────────────────────────────────
    if (opts.ratchet) {
      const baselineFile = path.join(EVAL_RESULTS_DIR, `${personaId}-${checkType}-baseline.json`);
      if (fs.existsSync(baselineFile)) {
        const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
        const ratchet = ratchetCompare(baseline, result);
        console.log('');
        printRatchet(ratchet);

        if (ratchet.ratchet_status === 'FAIL') {
          process.exit(1);
        }
      } else {
        console.log('\n⚠️  Baseline yok — bu çalıştırma baseline olarak kaydedildi.');
        fs.copyFileSync(
          path.join(EVAL_RESULTS_DIR, `${personaId}-${checkType}-latest.json`),
          baselineFile
        );
      }
    }
    return;
  }

  // ── Mode: Dry-run / info (no responses file) ──────────────────────────
  console.log(`\n📋 Eval Set: ${personaId} / ${checkType}`);
  console.log(`   Test sayısı: ${evalSet.length}`);
  console.log(`   Dosya: brains/personas/${personaId}/eval-set/${checkType}.json\n`);
  console.log('   Test Cases:');
  evalSet.forEach((tc, i) => {
    console.log(`   ${i + 1}. [${tc.id}] ${tc.description}`);
    console.log(`      Prompt: "${tc.prompt.substring(0, 80)}..."`);
  });
  console.log(`\n💡 Kullanım: cofounder-office persona-eval --persona ${personaId} --eval-set ${checkType} --responses <dosya.json>`);
};

/**
 * Print eval summary to console.
 */
function printSummary(result) {
  const s = result.summary;
  console.log(`\n${'━'.repeat(60)}`);
  console.log(`📊 Eval Sonuçları: ${result.persona} / ${result.check_type}`);
  console.log(`${'━'.repeat(60)}`);

  for (const r of result.results) {
    const icon = r.pass ? '✅' : '❌';
    const scoreBar = '█'.repeat(Math.floor(r.score / 10)) + '░'.repeat(10 - Math.floor(r.score / 10));
    console.log(`  ${icon} [${r.test_id}] ${r.description}`);
    console.log(`     Skor: ${scoreBar} ${r.score}/100`);

    if (r.details) {
      for (const d of r.details) {
        if (d.status === 'FAIL') {
          console.log(`     ⚠️  ${d.check}: ${d.message || 'FAIL'}`);
        }
      }
    }
    if (r.error) {
      console.log(`     🔴 Hata: ${r.error}`);
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Toplam: ${s.total} | Geçen: ${s.passed} | Kalan: ${s.failed}`);
  console.log(`  Ortalama Skor: ${s.average_score}/100`);
  console.log(`  Geçme Oranı: ${s.pass_rate}`);
  console.log(`${'━'.repeat(60)}\n`);
}

/**
 * Print ratchet comparison to console.
 */
function printRatchet(ratchet) {
  const icon = ratchet.ratchet_status === 'PASS' ? '✅' : '🔴';
  console.log(`${icon} Ratchet: ${ratchet.ratchet_status}`);

  if (ratchet.regressions.length > 0) {
    console.log(`   🔻 Gerileme (önceden geçiyordu, şimdi geçmiyor):`);
    for (const r of ratchet.regressions) {
      console.log(`      - [${r.test_id}] ${r.description} (${r.baseline_score} → ${r.current_score})`);
    }
  }
  if (ratchet.improvements.length > 0) {
    console.log(`   🔺 İyileşme:`);
    for (const r of ratchet.improvements) {
      console.log(`      - [${r.test_id}] ${r.description} (${r.baseline_score} → ${r.current_score})`);
    }
  }
}
